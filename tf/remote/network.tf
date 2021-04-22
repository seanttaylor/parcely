
resource "aws_vpc" "app_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = {
    slug = local.vpcSlug
    categoryId = local.categoryId
  }
}

resource "aws_subnet" "subnet_us_east_1a_pub" {
  vpc_id     = aws_vpc.app_vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = {
    categoryId = local.categoryId
  }
}

resource "aws_subnet" "subnet_us_east_1b_priv" {
  vpc_id     = aws_vpc.app_vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  tags = {
    categoryId = local.categoryId
  }
}

resource "aws_route_table" "rt_pub" {
  vpc_id = aws_vpc.app_vpc.id
  tags = {
    categoryId = local.categoryId
  }
}

resource "aws_route_table" "rt_priv" {
  vpc_id = aws_vpc.app_vpc.id
  tags = {
    categoryId = local.categoryId
  }
}

resource "aws_route_table_association" "public_subnet" {
  subnet_id      = aws_subnet.subnet_us_east_1a_pub.id
  route_table_id = aws_route_table.rt_pub.id
}

resource "aws_route_table_association" "private_subnet" {
  subnet_id      = aws_subnet.subnet_us_east_1b_priv.id
  route_table_id = aws_route_table.rt_priv.id
}

resource "aws_eip" "nat" {
  vpc = true
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.app_vpc.id
}

resource "aws_nat_gateway" "ngw" {
  subnet_id     = aws_subnet.subnet_us_east_1a_pub.id
  allocation_id = aws_eip.nat.id

  depends_on = [
    aws_internet_gateway.igw
  ]
}

resource "aws_route" "public_igw" {
  route_table_id         = aws_route_table.rt_pub.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route" "private_ngw" {
  route_table_id         = aws_route_table.rt_priv.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.ngw.id
}

resource "aws_security_group" "http" {
  name        = "http"
  description = "HTTP traffic"
  vpc_id      = aws_vpc.app_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "https" {
  name        = "https"
  description = "HTTPS traffic"
  vpc_id      = aws_vpc.app_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "egress-all" {
  name        = "egress_all"
  description = "Allow all outbound traffic"
  vpc_id      = aws_vpc.app_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "api-ingress" {
  name        = "api_ingress"
  description = "Allow ingress to APIs (i.e. parcely-core)"
  vpc_id      = aws_vpc.app_vpc.id

  ingress {
    from_port   = 80
    to_port     = 3000
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }
}