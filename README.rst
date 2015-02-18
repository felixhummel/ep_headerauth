TODO
====
- authorization for admin (use settings for that)
- example nginx conf file
- EPIC WARNING that this is insecure if configured incorrectly
    - you NEED a proxy for this
    - your proxy MUST set x-forwarded-for


Debug Install
=============
::

    cd $ETHERPAD_DIR
    cd node_modules/
    git clone https://github.com/felixhummel/ep_headerauth.git

