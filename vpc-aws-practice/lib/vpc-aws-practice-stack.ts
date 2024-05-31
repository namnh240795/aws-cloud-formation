import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class VpcAwsPracticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'VpcAwsPracticeQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const vpc = new cdk.aws_ec2.CfnVPC(this, 'AWS-Practice', {
      cidrBlock: '10.0.0.0/16',
      tags: [{
        key: 'Name',
        value: 'aws-practice',
      }]
    });

    const publicSubnet = new cdk.aws_ec2.CfnSubnet(this, 'AWS-Practice-Public-Subnet', {
      availabilityZone: 'ap-southeast-1a',
      cidrBlock: '10.0.1.0/24', // 2^8 - 5 = 251 ip addresses
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'aws-practice-public-subnet',
        },
      ],
    });
    
    const privateSubnet = new cdk.aws_ec2.CfnSubnet(this, 'AWS-Practice-Private-Subnet', {
      availabilityZone: 'ap-southeast-1b',
      cidrBlock: '10.0.10.0/24', // 2^8 - 5 = 251 ip addresses
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'aws-practice-private-subnet',
        },
      ],
    });

    const internetGateway = new cdk.aws_ec2.CfnInternetGateway(this, 'AWS-Practice-InternetGateway', {
      tags: [
        {
          key: 'Name',
          value: 'aws-practice-internet-gateway',
        },
      ],
    });

    new cdk.aws_ec2.CfnVPCGatewayAttachment(this, 'AWS-Practice-InternetGateway-Attachment', {
      vpcId: vpc.attrVpcId,
      internetGatewayId: internetGateway.ref,
    });


    const publicRouteTable = new cdk.aws_ec2.CfnRouteTable(this, 'AWS-Practice-PublicRouteTable', {
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'aws-practice-public-route-table',
        },
      ],
    });

    new cdk.aws_ec2.CfnSubnetRouteTableAssociation(this, 'AWS-Practic-RouteTable-PublicSubnet-Association', {
      subnetId: publicSubnet.attrSubnetId,
      routeTableId: publicRouteTable.ref,
    });

    new cdk.aws_ec2.CfnRoute(this, 'AWS-Practic-RouteTable-InternetGateway', {
      routeTableId: publicRouteTable.attrRouteTableId,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: internetGateway.attrInternetGatewayId,
    });
  }
}
