# Find out more about this configuration in the following Fargate/Terraform tutorial: https://section411.com/2019/07/hello-world/


variable "access_key" {
  type        = string
  description = "AWS Access Key ID"
}

variable "secret_key" {
  type        = string
  description = "AWS Secret Access Key" 
}

variable "account_id" {
  type        = string
  description = "AWS Account ID"
  default     = ""
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  access_key                  = var.access_key
  secret_key                  = var.secret_key 
  profile                     = "default"
  region                      = "us-east-1"
}

variable "TFC_CONFIGURATION_VERSION_GIT_BRANCH" {
  type = string
  default = ""
}

variable "TFC_CONFIGURATION_VERSION_GIT_COMMIT_SHA" {
  type = string
  default = ""
}

data "aws_ssm_parameter" "platform_outbound_email_username" {
  depends_on = [aws_ssm_parameter.platform_outbound_email_username]
  name = "/dev/parcely-core/credentials/mailer/outbound-email-username"
}

data "aws_ssm_parameter" "platform_outbound_email_password" {
  depends_on = [aws_ssm_parameter.platform_outbound_email_password]
  name = "/dev/parcely-core/credentials/mailer/outbound-email-password"
}

data "aws_ssm_parameter" "jwt_secret" {
  name = "/dev/parcely-core/ops/jwt-secret"
}


resource "aws_ecs_cluster" "parcely_core" {
  name = "parcely-core"
}

# Configuration for Cloudwatch Logs
resource "aws_cloudwatch_log_group" "parcely_core" {
  name = "/ecs/parcely/core"
}

# ecs.tf
resource "aws_ecs_service" "parcely_core" {
  name            = "parcely_core"
  task_definition = "${aws_ecs_task_definition.parcely_core.family}:${aws_ecs_task_definition.parcely_core.revision}"
  cluster         = aws_ecs_cluster.parcely_core.id
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
     assign_public_ip = false

    security_groups = [
      "${aws_security_group.egress-all.id}",
      "${aws_security_group.api-ingress.id}",
    ]

    subnets = [
      "${aws_subnet.subnet_us_east_1b_priv.id}"
    ]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.parcely_core.arn
    container_name   = "parcely_core"
    container_port   = "3000"
  }
}

# Defines the task that will be running to provide our service. 
# If the service decides it needs more capacity,
# this task definition provides a blueprint for building an identical container.
#
resource "aws_ecs_task_definition" "parcely_core" {
  family = "parcely_core"
  execution_role_arn = aws_iam_role.default-task-execution-role.arn

  container_definitions = <<EOF
  [
    {
      "name": "parcely_core",
      "image": "${var.account_id}.dkr.ecr.us-east-1.amazonaws.com/parcely/core:${substr(var.TFC_CONFIGURATION_VERSION_GIT_COMMIT_SHA, 0, 7)}",
      "portMappings": [
        {
          "containerPort": 3000
        }
      ],
      "environment": [{
        "name": "NODE_ENV",
        "value": "dev"
      },
      {
        "name": "COMMIT_HASH",
        "value": "${substr(var.TFC_CONFIGURATION_VERSION_GIT_COMMIT_SHA, 0, 7)}"
      },
      {
        "name": "JWT_SECRET",
        "value": "${data.aws_ssm_parameter.jwt_secret.value}"
      },
      {
        "name": "PLATFORM_OUTBOUND_EMAIL_USERNAME",
        "value": "${data.aws_ssm_parameter.platform_outbound_email_username.value}"
      },
      {
        "name": "PLATFORM_OUTBOUND_EMAIL_PASSWORD",
        "value": "${data.aws_ssm_parameter.platform_outbound_email_password.value}"
      }],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-region": "us-east-1",
          "awslogs-group": "/ecs/parcely/core",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
  EOF

  # These are the minimum values for Fargate containers.
  cpu = 256
  memory = 512
  requires_compatibilities = ["FARGATE"]

  # This is required for Fargate containers.
  network_mode = "awsvpc"

  tags = {
    categoryId = local.categoryId
  }
}

resource "aws_lb_target_group" "parcely_core" {
  name = "parcely-core"
  port = 3000
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = aws_vpc.app_vpc.id

  health_check {
    enabled = true
    path = "/status"
  }

  depends_on = [
    aws_alb.parcely_core
  ]
}

resource "aws_alb" "parcely_core" {
  name = "parcely-core-lb"
  internal = false
  load_balancer_type = "application"

  subnets = [
    "${aws_subnet.subnet_us_east_1a_pub.id}",
    "${aws_subnet.subnet_us_east_1b_priv.id}"
  ]

  security_groups = [
    "${aws_security_group.http.id}",
    "${aws_security_group.https.id}",
    "${aws_security_group.egress-all.id}",
    "${aws_security_group.api-ingress.id}"
  ]

  depends_on = [aws_internet_gateway.igw]

  tags = {
    appOwner   = local.appOwner
    categoryId = local.categoryId
  }
}

resource "aws_alb_listener" "parcely_core_http" {
  load_balancer_arn = aws_alb.parcely_core.arn
  port = "80"
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.parcely_core.arn
  }
}

# This is the role under which ECS will execute our task. This role becomes more important as we add integrations with other AWS services later on.

# The assume_role_policy field works with the following aws_iam_policy_document to allow ECS tasks to assume this role we're creating.
resource "aws_iam_role" "default-task-execution-role" {
  name = "default-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs-task-assume-role.json
}

data "aws_iam_policy_document" "ecs-task-assume-role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Normally we'd prefer not to hardcode an ARN in our Terraform, but since this is an AWS-managed
# policy, it's okay.
data "aws_iam_policy" "ecs-task-execution-role" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Attach the above policy to the execution role.
resource "aws_iam_role_policy_attachment" "ecs-task-execution-role" {
  role = aws_iam_role.default-task-execution-role.name
  policy_arn = data.aws_iam_policy.ecs-task-execution-role.arn
}

resource "aws_ssm_parameter" "platform_outbound_email_username" {
  name  = "/dev/parcely-core/credentials/mailer/outbound-email-username"
  type  = "String"
  value = local.platformOutboundEmailUsername
}

resource "aws_ssm_parameter" "platform_outbound_email_password" {
  name  = "/dev/parcely-core/credentials/mailer/outbound-email-password"
  type  = "SecureString"
  value = local.platformOutboundEmailPassword
}