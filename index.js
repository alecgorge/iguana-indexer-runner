var kue = require('kue')
,	queue = kue.createQueue({ redis: process.env['REDIS_URL'] || 'redis://127.0.0.1:6379' })
,	sprintf = require('util').format
;

var indexers = {
	'archive': require('./lib/archive')
}

queue.process('index artist', 5, function (job, ctx, done) {
	var indexer = indexers[job.data.source];
	if(indexer) {
		indexer.indexArtist(job, ctx, done, queue);
	}
	else {
		done(new Error(sprintf('Unknown content source (%j): %s', Object.keys(indexers), job.data.source)));
	}
});

queue.process('index show', 20, function (job, ctx, done) {
	var indexer = indexers[job.data.source];
	if(indexer) {
		indexer.indexShow(job, ctx, done, queue);

		// calculate years??
	}
	else {
		done(new Error(sprintf('Unknown content source (%j): %s', Object.keys(indexers), job.data.source)));
	}
});
