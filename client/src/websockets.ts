import * as signalR from "@microsoft/signalr";

const ws = "http://localhost:5277"
export const chatConnection = new signalR.HubConnectionBuilder().withUrl(ws+"/Hubs/ChatHub").withAutomaticReconnect().build();
export const notificationConnection = new signalR.HubConnectionBuilder().withUrl(ws+"/Hubs/NotificationHub").withAutomaticReconnect().build();
