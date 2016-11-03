import { Mongo } from 'meteor/mongo';

const Branches = new Mongo.Collection('branches');
const Notifications = new Mongo.Collection('notifications');

export { Branches, Notifications }