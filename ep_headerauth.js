// Be sure to check out ep_ldapauth!

var ERR = require('async-stacktrace');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');

exports.authenticate = function(hook_name, context, cb) {
  console.debug('ep_headerauth.authenticate');
  var header_name = 'x-forwarded-user'; // TODO maybe configurable?
  // If auth headers are present use them to authenticate
  var header_value = context.req.headers[header_name];
  if (header_value) {
    var username = header_value;
    var express_sid = context.req.sessionID;

    context.req.session.user = {
      username: username,
      displayName: username
    };

    settings.globalUserName = username;
    console.debug('ep_headerauth.authenticate: deferring setting of username [%s] to CLIENT_READY for express_sid = %s', username, express_sid);
    console.debug('ep_headerauth.authenticate: successful authentication');
    return cb([true]);
  } else {
    console.debug('ep_headerauth.authenticate: failed authentication no auth headers');
    return cb([false]);
  }
};

exports.handleMessage = function(hook_name, context, cb) {
  console.debug("ep_headerauth.handleMessage");
  if ( context.message.type == "CLIENT_READY" ) {
    if (!context.message.token) {
      console.debug('ep_headerauth.handleMessage: intercepted CLIENT_READY message has no token!');
    } else {
      var client_id = context.client.id;
      console.debug('client id: %s', client_id);
      console.debug(context.client.client.request.session);
      var session = context.client.client.request.session;
      if ('user' in session) {
        var displayName = session.user.displayName;
        console.debug('ep_headerauth.handleMessage: intercepted CLIENT_READY message for client_id = %s, setting username for token %s to %s', client_id, context.message.token, displayName);
        set_author_name(context.message.token, displayName);
      }
      else {
        console.debug('ep_headerauth.handleMessage: intercepted CLIENT_READY but user does have displayName !');
      }
    }
  } else if ( context.message.type == "COLLABROOM" && context.message.data.type == "USERINFO_UPDATE" ) {
    console.debug('ep_headerauth.handleMessage: intercepted USERINFO_UPDATE and dropping it!');
    return cb([null]);
  }
  return cb([context.message]);
};

function set_author_name(token, username) {
  console.debug('ep_headerauth.set_author_name: getting authorid for token %s', token);
  authorManager.getAuthor4Token(token, function(err, author) {
    if (ERR(err)) {
      console.debug('ep_headerauth.set_author_name: could not get authorid for token %s', token);
    } else {
      console.debug('ep_headerauth.set_author_name: have authorid %s, setting username to "%s"', author, username);
      authorManager.setAuthorName(author, username);
    }
  });
  return;
}

// vim: sw=2 ts=2 sts=2 et ai
