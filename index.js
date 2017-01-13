const notifier = require('node-notifier');
const open = require('open');
const io = require('socket.io-client');
const path = require('path');

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2), {
  default: {
    verbose: false,
    quiet: false,
  },
  alias: {
    n: 'name',
    name: 'name',
    v: 'verbose',
    verbose: 'verbose',
    server: 'server',
    s: 'server',
    q: 'quiet',
    quiet: 'quiet',
  },
});

function logMessage(message) {
  if (!argv.quiet) {
    console.log(message);
  }
}

if(!argv.name) {
  logMessage('Please Specify Your Github Handle with `-n hharnisc or --name hharnisc`');
  process.exit(1);
}

if (!argv.server) {
  logMessage('Please A Github Notify Server `-s http://example.com or --server http://example.com`');
  process.exit(1);
}

logMessage(`Connecting: ${argv.server}`);

const socket = io.connect(argv.server);

socket.on('payload', function(data){
  if (data.action === 'assigned' && data.assignee.login === argv.name) {
    notifier.notify({
      'title': `New Pull Request Assigned`,
      'message': `${data.sender.login} thinks you're awesome and would like you to review some code`,
      'icon': path.join(__dirname, 'icon.png'),
      'open': data.pull_request.html_url,
      'wait': true,
      'sound': 'Funk',
    });
    logMessage(`New Pull Request Assigned From ${data.sender.login} - ${data.pull_request.html_url}`);
  }
  if (argv.verbose) {
    logMessage(JSON.stringify(data, null, 2));
  }
});

socket.on('connect_error', function() {
  logMessage(`Could Not Connect: ${argv.server}`);
});

socket.on('connect', function () {
  logMessage(`Connected To: ${argv.server}`);
  logMessage(`Waiting for PRs assigned to ${argv.name}`);
});

notifier.on('click', function (notifierObject, options) {
  open(options.open);
});
