import { Video } from "./Video";

export class User {
  id?: string;
  clientId: string;
  name: string;
  videos: Video[];
}