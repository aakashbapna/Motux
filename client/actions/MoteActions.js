import Dispatcher from '../AppDispatcher';

var MoteActions = {
	create: function(mote) {
		Dispatcher.dispatch({
			actionType: 'player_added',
			moteData: mote
		});
	},
	update: function(id, options) {
		//console.log("action called");
		Dispatcher.dispatch({
			actionType: 'player_updated',
			id: id,
			options: options
		});
	},
	destroy: function(id) {
		Dispatcher.dispatch({
			actionType: 'player_removed',
			moteId: id
		});
	}
};

export default MoteActions;
