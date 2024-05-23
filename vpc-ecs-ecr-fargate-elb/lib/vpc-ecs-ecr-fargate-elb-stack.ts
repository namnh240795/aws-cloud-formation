import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class VpcEcsEcrFargateElbStack extends cdk.Stack {

  private readonly namePrefix = "namnh240795"

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new cdk.aws_ec2.Vpc(this, `${this.namePrefix}-vpc`, {
      ipAddresses: cdk.aws_ec2.IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 2,
      subnetConfiguration: [
        {
          // for load balancer
          cidrMask: 24,
          name: `${this.namePrefix}-ingress`,
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
        },
        {
          // for database, application
          cidrMask: 24,
          name: `${this.namePrefix}-rds`,
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      natGateways: 0,
    })

    // add gateway s3 endpoint
    vpc.addGatewayEndpoint(`${this.namePrefix}-s3-gw`, {
      service: cdk.aws_ec2.GatewayVpcEndpointAwsService.S3,
    });

    // add ecr endpoint
    vpc.addInterfaceEndpoint(`${this.namePrefix}-ecr`, {
      service: cdk.aws_ec2.InterfaceVpcEndpointAwsService.ECR,
    });

    // add ecr docker endpoint
    vpc.addInterfaceEndpoint(`${this.namePrefix}-ecr-dkr`, {
      service: cdk.aws_ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    // add cloudwatch endpoint
    vpc.addInterfaceEndpoint(`${this.namePrefix}-cloudwatch`, {
      service: cdk.aws_ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });


    const cluster = new cdk.aws_ecs.Cluster(
      this,
      `${this.namePrefix}-ecs-cluster`,
      {
        vpc: vpc,
      }
    );

    const taskDefinition = new cdk.aws_ecs.FargateTaskDefinition(
      this,
      `${this.namePrefix}-task-definition`
    );

    const container = taskDefinition.addContainer(
      `${this.namePrefix}-container`,
      {
        image: cdk.aws_ecs.ContainerImage.fromEcrRepository(
          cdk.aws_ecr.Repository.fromRepositoryName(
            this,
            'namnh240795-vpc-dev-ecr-id',
            "namnh240795-vpc-dev-ecr"
          ),
          "latest"
        ),
        logging: cdk.aws_ecs.LogDrivers.awsLogs({
          streamPrefix: `${this.namePrefix}-container`,
          logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
        }),
        memoryLimitMiB: 512,
        cpu: 256,
      }
    );

    container.addPortMappings({
      containerPort: 80,
      hostPort: 80,
    });
    
    const service = new cdk.aws_ecs.FargateService(
      this,
      `${this.namePrefix}-service`,
      {
        cluster: cluster,
        taskDefinition: taskDefinition,
        // vpcSubnets: {
        //   subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
        // },
        assignPublicIp: false,

      }
    );

    const lb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      `${this.namePrefix}-lb`,
      {
        vpc: vpc,
        internetFacing: true,
      }
    );

    const listener = lb.addListener(`${this.namePrefix}-listener`, {
      port: 80,
    });

    listener.addTargets(`${this.namePrefix}-target`, {
      port: 80,
      targets: [service],
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
    });

    new cdk.CfnOutput(this, 'LoadBalancerDnsName', {
      value: lb.loadBalancerDnsName,
    });

    new cdk.CfnOutput(this, 'ServiceName', {
      value: service.serviceName,
    });
  }
}