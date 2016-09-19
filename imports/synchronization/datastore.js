import { Mongo } from 'meteor/mongo';

const Branches = new Mongo.Collection('branches');

export { Branches }