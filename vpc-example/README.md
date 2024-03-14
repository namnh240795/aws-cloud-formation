# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

### VPC explaination

* A virtual private cloud network

* Availability zone is the datacenter (building 1, building 2)

* If one building is down, your app should still be available.

* Below image shows a VPC that have 2 public subnets and 2 private subnets, a route-table, and a internet-gateway

* Only components that are inside public subnet could reach the internet. (example: a ec2-instance inside a public subnet could reach the internet while ec2-instance inside private subnet cannot).

* Public subnet: Backend API Gateway, Frontend,...

* Private subnet: Database, Redis, ...

![IMG](./vpc-sample.png =415x575.333333333)

### CIDR Explaination

VPC IP Address Range: 10.0.0.0/16 (65536 IPs)

* Public subnet 1: 10.0.1.0/24 (256 IPs) A subset of VPC IPs
* Private subnet 1: 10.0.10.0/24 (256 IPs) A subset of VPC IPs

* Public subnet 2: 10.0.2.0/24 (256 IPs) A subset of VPC IPs
* Private subnet 2: 10.0.20.0/24 (256 IPs) A subset of VPC IPs

* Instance inside subnet gonna use the IPs inside CIDR 


Example:

* ec2 instance inside public subnet 1: 10.0.1.123

* ec2 instance inside public subnet 2: 10.0.2.3



