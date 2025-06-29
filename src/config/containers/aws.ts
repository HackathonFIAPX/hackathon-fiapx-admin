import { IS3Handler } from "@infra/aws/s3/IS3Handler";
import { S3Handler } from "@infra/aws/s3/S3Handler";
import { container } from "tsyringe";

container.registerSingleton<IS3Handler>('IS3Handler',S3Handler);