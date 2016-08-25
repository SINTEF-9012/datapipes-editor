import { Meteor } from 'meteor/meteor';

let SynchronizationUtils = {
    getUserId: getUserIdFct,
    getRawElements : getRawElementsFct
};

function getUserIdFct() {
    try {
        return Meteor.userId();
    } catch (e) {
        return '';
    }
}

function getRawElementsFct(arrayOfElements) {
    return arrayOfElements.map((e) => {
        return e.raw();
    });
}

export {SynchronizationUtils}

