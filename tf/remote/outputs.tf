output "git_branch_name" {
  value = var.TFC_CONFIGURATION_VERSION_GIT_BRANCH
}

output "git_commit_sha" {
  value = "${substr(var.TFC_CONFIGURATION_VERSION_GIT_COMMIT_SHA, 0, 7)}"
}

output "vpc_id" {
  value = "${aws_vpc.app_vpc.id}"
}

output "public_subnet_id" {
  value = "${aws_subnet.subnet_us_east_1a_pub.id}"
}

output "private_subnet_id" {
  value = "${aws_subnet.subnet_us_east_1b_priv.id}"
}

output "parcely_core_public_alb_url" {
  value = "http://${aws_alb.parcely_core.dns_name}"
}