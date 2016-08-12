import { Class } from 'meteor/jagi:astronomy';

const HistoryVersions = new Mongo.Collection('historyVersions');
export const Version = Class.create({
    name: 'version',
    collection: HistoryVersions,
    typeField: 'type',
    secured: false,
    fields: {
        description: {
            type: String,
            default: ''
        },
        owner: {
            type: String,
            default: 'Anonymous'
        },
        timestamp: {
            type: Date,
            default() { return new Date();}
        },
        changes: {
            type: [Object],
            default() { return []; }
        }
    }
});