import { Class, Enum } from 'meteor/jagi:astronomy';
import { Mongo } from 'meteor/mongo';

const Notifications = new Mongo.Collection(null);

const Status = Enum.create({
    name:'Status',
    identifiers: ['News', 'Warning', 'Info', 'Success', 'Error']
});

const Notification = Class.create({
    name: 'notification',
    typeField: 'type',
    secured: false,
    collection: Notifications,
    fields: {
        status: {
            type: Status,
            default: 'INFO'
        },
        read: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            default: ''
        },
        timestamp: {
            type: Date,
            immutable: true,
            default() {
                return new Date();
            }
        },
    }
});

export { Notification, Status };