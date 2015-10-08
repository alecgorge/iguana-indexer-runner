const FILENAME = 'archive_importer.php';

var child_process = require('child_process')
;

var runProcess = function (command, args, cb) {
	var proc = cp.spawn(command, args);

	stdoutString = '';
	stderrString = '';

	proc.stdout.on('data', function (data) {
		stdoutString += data.toString('utf8');
	});

	proc.stderr.on('data', function (data) {
		stderrString += data.toString('utf8');
	});

	proc.on('close', function (code) {
		cb(code, stdout, stderr);
	});
};

exports.indexingOptions = {
	onePass: false
};

exports.indexArtist = function (job, ctx, done, queue) {
	runProcess('php', ['-f', FILENAME, 'artist', job.data.slug], function (exitCode, stdout, stderr) {
		try {
			if(exitCode == 0) {
				var shows = JSON.parse(stdout);

				shows.forEach(function(showId) {
					queue.create('index show', {
						'title': 'Index ' + showId + ' by ' + job.data.slug,
						'source': 'archive',
						'showId': showId
					}).attempts(5).backoff({ type: 'exponential' });
				});

				done(null, stdout);
			}
			else {
				done(new Error(stderr));
			}
		}
		catch (e) {
			done(new Error(e));
		}
	});
};

exports.indexShow = function (job, ctx, done, queue) {
	runProcess('php', ['-f', FILENAME, 'show', job.data.showId], function (exitCode, stdout, stderr) {
		try {
			if(exitCode == 0) {
				done(null, stdout);
			}
			else {
				done(new Error(stderr));
			}
		}
		catch (e) {
			done(new Error(e));
		}
	});
};
