const notifier = require('node-notifier');
const open = require('open');
const io = require('socket.io-client');
const path = require('path');

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2), {
  default: {
    verbose: false,
  },
  alias: {
    n: 'name',
    name: 'name',
    v: 'verbose',
    verbose: 'verbose',
    server: 'server',
    s: 'server'
  },
});

if(!argv.name) {
  console.log('Please Specify Your Github Handle with `-n hharnisc or --name hharnisc`');
  process.exit(1);
}

if (!argv.server) {
  console.log('Please A Github Notify Server `-s http://example.com or --server http://example.com`');
  process.exit(1);
}

console.log(`Connecting: ${argv.server}`);

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
    console.log(`New Pull Request Assigned From ${data.sender.login} - ${data.pull_request.html_url}`);
  }
  if (argv.verbose) {
    console.log(JSON.stringify(data, null, 2));
  }
});

socket.on('connect_error', function() {
  console.log(`Could Not Connect: ${argv.server}`);
});

socket.on('connect', function () {
  console.log(`Connected To: ${argv.server}`);
  console.log(`Waiting for PRs assigned to ${argv.name}`);
});

notifier.on('click', function (notifierObject, options) {
  open(options.open);
});
