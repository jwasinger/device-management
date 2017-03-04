# Create a new instance of the latest Ubuntu 14.04 on an
# t2.micro node with an AWS Tag naming it "HelloWorld"
provider "aws" {
  region = "us-west-2"
}

resource "aws_eip" "lb" {
  instance = "${aws_instance.instance.id}"
  vpc      = true
}

# instance ami

/*
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*"]
  }
  filter {
    name = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}
*/

resource "aws_instance" "instance" {
  ami = "ami-d2c924b2"
  instance_type = "t2.micro"
  iam_instance_profile = "${ aws_iam_instance_profile.instance_profile.id}"
  security_groups = ["allow_ssh_http"]
  key_name = "MyKeyPair"
  tags {
    Name = "HelloWorld"
  }
  provisioner "file" {
    source = "provision-centos.sh"
    destination = "/tmp/provision-centos.sh"
    connection {
      type = "ssh"
      user = "centos"
      private_key = "${file("another-key.pem")}"
      timeout = "5m"
    }
  }
  /*
  provisioner "remote-exec" {
    inline = [
      "sudo chmod +x /tmp/provision-centos.sh",
      "sudo /tmp/provision-centos.sh"
    ]
    connection {
      type = "ssh"
      user = "centos"
      private_key = "${file("another-key.pem")}"
    }
  }
  */
}

# instance role

resource "aws_iam_instance_profile" "instance_profile" {
    name = "ec2_instance_profile"
    roles = ["${aws_iam_role.ec2_trust_role.name}"]
}

# policy to allow ec2 access to s3
resource "aws_iam_role" "ec2_trust_role" {
  name = "ec2_trust_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "s3_policy" {
  name = "s3_policy"
  role = "${aws_iam_role.ec2_trust_role.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

# CodeDeploy service role


resource "aws_iam_role" "code_deploy_service_role" {
    name = "code_deploy_service_role"
    path = "/"
    assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "codedeploy.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

# instance security group definition

resource "aws_security_group" "allow_ssh_http" {
  name = "allow_ssh_http"
  description = "Allow HTTP and SSH traffic inbound.  Allow all traffic outbound."

  ingress {
      from_port = 80
      to_port = 80
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
      from_port = 22
      to_port = 22
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
      from_port = 0
      to_port = 0
      protocol = "-1"
      cidr_blocks = ["0.0.0.0/0"]
  } 
}

# code deploy application and deployment group
resource "aws_codedeploy_app" "material-dashboard-application" {
  name = "material-dashboard-application"
}

resource "aws_iam_role_policy" "code_deploy_trust_role_policy" {
    name = "code_deploy_trust_role_policy"
    role = "${aws_iam_role.code_deploy_trust_role.id}"
    policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "autoscaling:CompleteLifecycleAction",
                "autoscaling:DeleteLifecycleHook",
                "autoscaling:DescribeAutoScalingGroups",
                "autoscaling:DescribeLifecycleHooks",
                "autoscaling:PutLifecycleHook",
                "autoscaling:RecordLifecycleActionHeartbeat",
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceStatus",
                "tag:GetTags",
                "tag:GetResources"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_role" "code_deploy_trust_role" {
    name = "code_deploy_trust_role"
    assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "codedeploy.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_codedeploy_deployment_group" "foo" {
    app_name = "${aws_codedeploy_app.material-dashboard-application.name}"
    deployment_group_name = "site-dg"
    service_role_arn = "${aws_iam_role.code_deploy_trust_role.arn}"

    ec2_tag_filter {
        key = "Name"
        type = "KEY_AND_VALUE"
        value = "HelloWorld"
    }

/*
    trigger_configuration {
        trigger_events = ["DeploymentFailure"]
        trigger_name = "foo-trigger"
        trigger_target_arn = "foo-topic-arn"
    }
*/

}
