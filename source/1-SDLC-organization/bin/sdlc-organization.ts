/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {
    AWSBootstrapKitLandingZonePipelineStack,
    AWSBootstrapKitLandingZoneStage
} from '../lib/cicd-stack';
import {AccountType, OUSpec} from 'aws-bootstrap-kit';
import { RemovalPolicy } from 'aws-cdk-lib';

const app = new cdk.App();

const email = app.node.tryGetContext("email");
const rootHostedZoneDNSName = app.node.tryGetContext("domain_name");
const thirdPartyProviderDNSUsed = app.node.tryGetContext("third_party_provider_dns_used");
const forceEmailVerification = app.node.tryGetContext("force_email_verification");
const pipelineDeployableRegions = app.node.tryGetContext("pipeline_deployable_regions");
const nestedOU:OUSpec[] = [
    {
        name: 'Shared',
        accounts: [
            {
                name: 'CICD',
                type: AccountType.CICD,
                existingAccountId: '820163106649'
            },
            {
                name: 'Security',
                type: AccountType.PLAYGROUND,
                existingAccountId: '433856934137'
            }
        ]
    },
    {
        name: 'SDLC',
        accounts: [
            {
                name: 'Dev',
                type: AccountType.STAGE,
                stageName: 'dev',
                stageOrder: 0,
                existingAccountId: '038688679310',
                removalPolicy: RemovalPolicy.DESTROY
            },
            {
                name: 'Staging',
                type: AccountType.STAGE,
                stageName: 'staging',
                stageOrder: 1,
                hostedServices: ['ALL'],
                existingAccountId: '338575324958'
            }
        ]
    },
    {
        name: 'Prod',
        accounts: [
            {
                name: 'Prod',
                type: AccountType.STAGE,
                stageName: 'prod',
                stageOrder: 2,
                hostedServices: ['ALL'],
                existingAccountId: '676712036918'
            }
        ]
    }
];


new AWSBootstrapKitLandingZoneStage(app, 'Prod',{
  email,
  forceEmailVerification,
  nestedOU,
  rootHostedZoneDNSName,
  thirdPartyProviderDNSUsed
});

new AWSBootstrapKitLandingZonePipelineStack(app, 'AWSBootstrapKit-LandingZone-PipelineStack', {
  email,
  forceEmailVerification,
  pipelineDeployableRegions,
  nestedOU,
  rootHostedZoneDNSName,
  thirdPartyProviderDNSUsed
});
