import Events from 'events';
import assign from 'object-assign';

import Mote from '../components/Mote';
import Point from '../components/Point';
import Dispatcher from '../AppDispatcher';

var EventEmitter = Events.EventEmitter;

var CHANGE_EVENT = 'change';

var _motes = [];

function create(options) {
	var newMote = new Mote(options);
	_motes[newMote.id] = newMote;
}

function add(_mote) {
	_motes[_mote.id] = _mote;
}

function update(id, newOptions) {
	//console.log("store update called");
	if(!_motes[id]) {
		create(newOptions);
	} else {
		_motes[id].pos = new Point(newOptions.pos.x, newOptions.pos.y, newOptions.pos.z);
	}
}

function destroy(id) {
	delete _motes[id];
}

var MoteStore = assign({}, EventEmitter.prototype, {
	getAll: function() {
		return _motes;
	},
	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}
});

Dispatcher.register(function(action) {
	//console.log("dispatched triggered action", action);
	switch(action.actionType) {
		case 'player_added':
			add(action.moteData);
			MoteStore.emitChange();
			break;

		case 'player_create':
			create(action.moteData);
			MoteStore.emitChange();
			break;

		case 'player_updated':
			update(action.id, action.options);
			MoteStore.emitChange();
			break;

		case 'player_removed':
			destroy(action.moteId);
			MoteStore.emitChange();
			break;

		default:
			break;
	}
});

export default MoteStore;

