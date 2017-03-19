[![Build Status](https://travis-ci.org/jwasinger/material-dashboard.svg?branch=master)](https://travis-ci.org/jwasinger/material-dashboard)

# Material Dashboard

  This application is a mockup for a graphical analytics dashboard built with AngularJS and 
  AngularMaterial.
  
  Check out the [live example](http://35.163.35.41) running in AWS.
## Setting up automatic deployment to AWS

### Create AWS Infrastructure

  This repository contains all necessary configuration to create the infrastructure to host this 
  application in AWS.  Assuming that you have Terraform configured with credentials for an existing 
  AWS account, place  private key file `private.pem` in the directory `infrastructure/terraform`.
  This will be used to log in to the EC2 instance that runs the web application.
  Then, run `terraform apply` under `infrastructure/terraform` to create the following 
  resources:
  1.  A single EC2 T2.micro instance with SSH .
  2.  A security group attached to the instance restricting traffic to ports 80 (HTTP) and 22 (SSH)
  3.  An Elastic IP address attached to the instance and placed in the default (public) subnet in the default VPC
  4.  A CodeDeploy application and deployment group configured with the necessary IAM policies to 
  access the EC2 instance for deployments

### Set up integration with Travis

  TravisCI is a free CI platform running on container-based infrastructure.  Travis is configured 
  to run unit tests, and upon successful completion, trigger a deployment to AWS via CodeDeploy.  
  In order for Travis to trigger deployments, it needs access keys.  Using the TravisCI CLI client 
  makes this easy.  Once the client is installed, remove the following section from `.travis.yml`:

```
secret_access_key:
  secure: B32545qkkdxp/EwgbZF9vTuIko4HiCzkZRX4EiXziMsrw0qW3z4H8oEXp76hsU63yPiAN/sIM4z4xNx3hvF7Iwyexc10vYhWfNCJ+EjeNkgt5MQUE94qhqhrouvT0RH2A2dmmGtwSY2juOKsabKZUnVwUVa1IwERjzcWLl0e5rJpsulKfwvRtZyZjyy/31AkmqASUjgaGGiQN0PW5pRyWRVJA0v9GX8pdRqiLTVXoKace/LDYiLwdkl3r8JO+rMCvBnqqljbmiUfSm6iZ1NO7G1mMkOiw9U8iNaZq7qU9KGnvr8g43z9X6Gs6wAY4AZh0+yvzhJT9CHzr4nl4FwZw+D9zh14rUFvKeSOwTK4q5aBzmk8t10Uc3/ROTCRnjMbNOvJmbO1Q00PPcYQUz5pNyX79mtI82KLOAdQc6bKl7bnC/c4W8KwlUiGQSSs9X2yAC6x4KnXq+HfJC9p6kNNpKXoAYl5wAF8wwgYwpwhzNAvXEo23yyjnENhirtwmMBpQqBRjyZW2I8z9a4kKaadhfWA14U7mBoomlAQ3Fa5gazJe8B95efnExo2cIgSuEDeVFC8dXYcP6Lf4jZ7cAIc3HuKJxZHK3FuX2Q1Ov/gZG72z4J79HlAHWOsBlTfIxl+YsuJBJfAbO4RER7O+wI8Cg9z4SOI1DLsgqkG07t+oIk= 
```

Then, run `travis encrypt --add deploy.secret_access_key`.  This will prompt for your access 
credentials.  Travis will encrypt the provided credentials and add them to `.travis.yml`.  
It is important to note that the key stored publicly in `.travis.yml` will only allow access to 
AWS resources from the repository where the encrypted key was created.  This means that storing 
the public access key ID and encryped secret access key in a public repostory is safe.
