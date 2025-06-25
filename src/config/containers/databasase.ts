import { DynamoDBConnector } from "@infra/persistence/dynamodb/dynamo-db-connector";
import { IDataBaseConnector } from "@infra/persistence/IDataBaseConnector";
import { container } from "tsyringe";

container.registerInstance<IDataBaseConnector>('DataBaseConnector', DynamoDBConnector.getInstance())