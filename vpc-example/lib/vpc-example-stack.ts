import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class VpcExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create the vpc
    const vpc = new cdk.aws_ec2.CfnVPC(this, 'AWS-CF-VPC-Example', {
      cidrBlock: '10.0.0.0/16',
      tags: [{
        key: 'Name',
        value: 'namnh240795-vpc-example',
      }]
    });
    
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.attrVpcId,
    })

    // create public subnet 1 and attach it to vpc
    const publicSubnet1 = new cdk.aws_ec2.CfnSubnet(this, 'AWS-CF-VPC-Example-PublicSubnet1', {
      availabilityZone: 'ap-southeast-1a',
      cidrBlock: '10.0.1.0/24', // 2^8 - 5 = 251 ip addresses
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-public-subnet-1',
        },
      ],
    });

    // create public subnet 2 and attach it to vpc
    const publicSubnet2 = new cdk.aws_ec2.CfnSubnet(this, 'AWS-CF-VPC-Example-PublicSubnet2', {
      availabilityZone: 'ap-southeast-1b',
      cidrBlock: '10.0.2.0/24', // 2^8 - 5 = 251 ip addresses
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-public-subnet-2',
        },
      ],
    });

    // create private subnet 1 and attach it to vpc
    const privateSubnet1 = new cdk.aws_ec2.CfnSubnet(this, 'AWS-CF-VPC-Example-PrivateSubnet1', {
      availabilityZone: 'ap-southeast-1a',
      cidrBlock: '10.0.10.0/24', // 2^8 - 5 = 251 ip addresses
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-private-subnet-1',
        },
      ],
    });

    // create private subnet 2 and attach it to vpc
    const privateSubnet2 = new cdk.aws_ec2.CfnSubnet(this, 'AWS-CF-VPC-Example-PrivateSubnet2', {
      availabilityZone: 'ap-southeast-1b',
      cidrBlock: '10.0.20.0/24', // 2^8 - 5 = 251 ip addresses
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-private-subnet-2',
        },
      ],
    });

    // create internet gateway and attach it to vpc
    const igw = new cdk.aws_ec2.CfnInternetGateway(this, 'AWS-CF-VPC-Example-InternetGateway', {
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-igw',
        },
      ],
    });

    // add internet gateway to vpc
    new cdk.aws_ec2.CfnVPCGatewayAttachment(this, 'AWS-CF-VPC-Example-InternetGatewayAttachment', {
      vpcId: vpc.attrVpcId,
      internetGatewayId: igw.ref,
    });

    // // create public route table
    const publicRouteTable = new cdk.aws_ec2.CfnRouteTable(this, 'AWS-CF-VPC-Example-PublicRouteTable', {
      vpcId: vpc.attrVpcId,
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-public-route-table',
        },
      ],
    });

    // add internet gateway to public route table
    new cdk.aws_ec2.CfnRoute(this, 'AWS-CF-VPC-Example-PublicRoute', {
      routeTableId: publicRouteTable.attrRouteTableId,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: igw.attrInternetGatewayId,
    });

    // associate public subnet 1 with public route table
    new cdk.aws_ec2.CfnSubnetRouteTableAssociation(this, 'AWS-CF-VPC-Example-PublicSubnet1RouteTableAssociation', {
      subnetId: publicSubnet1.attrSubnetId,
      routeTableId: publicRouteTable.ref,
    });

    // associate public subnet 2 with public route table
    new cdk.aws_ec2.CfnSubnetRouteTableAssociation(this, 'AWS-CF-VPC-Example-PublicSubnet2RouteTableAssociation', {
      subnetId: publicSubnet2.attrSubnetId,
      routeTableId: publicRouteTable.ref,
    });

    // get linux 2023 ami
    const linuxAmi = new cdk.aws_ec2.AmazonLinuxImage({
      generation: cdk.aws_ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
    });
    
    // create security group that allow ssh
    const ssh22sg = new cdk.aws_ec2.CfnSecurityGroup(this, 'AWS-CF-VPC-Example-SecurityGroup', {
      vpcId: vpc.attrVpcId,
      groupDescription: 'Allow SSH',
      securityGroupIngress: [
        {
          // allow ssh from any ipv4
          cidrIp: '0.0.0.0/0',
          fromPort: 22,
          toPort: 22,
          ipProtocol: 'tcp',
        },
      ],
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-ssh-security-group',
        },
      ],
    });

    // create new keypair
    const keyPair = new cdk.aws_ec2.CfnKeyPair(this, 'AWS-CF-VPC-Example-KeyPair', {
      keyName: 'namnh240795-vpc-example-key-pair',
      keyType: cdk.aws_ec2.KeyPairType.RSA
    });

    // create new ec2 instance using linux ami
    const ec2Instance = new cdk.aws_ec2.CfnInstance(this, 'AWS-CF-VPC-Example-EC2Instance', {
      imageId: linuxAmi.getImage(this).imageId,
      instanceType: 't2.nano',
      tags: [
        {
          key: 'Name',
          value: 'namnh240795-vpc-example-ec2-instance',
        },
      ],
      networkInterfaces: [{
        deviceIndex: '0',
        associatePublicIpAddress: true,
        subnetId: publicSubnet1.attrSubnetId,
        groupSet: [ssh22sg.ref],
      }],
      keyName: keyPair.keyName,
    });
  }  
}
