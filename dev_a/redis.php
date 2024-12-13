<?php

include '../init.php';

\IPS\Dispatcher\External::i();

header("Content-type: text/plain");

if ( isset( \IPS\Request::i()->key ) )
{
	print_r( \IPS\Redis::i()->debugGetKeys( isset( \IPS\Request::i()->key ) ? \IPS\Request::i()->key . '*' : '*' ) );
}

$redis = NULL;
$info  = NULL;
$datasource  = array();

if ( \IPS\CACHE_METHOD == 'Redis' or \IPS\STORE_METHOD == 'Redis' )
{
	$info = \IPS\Redis::i()->info();

	$data = array( 'type' => 'redis_datastore', 'count' => NULL, 'enabled' => false );

	if ( \IPS\STORE_METHOD == 'Redis' )
	{
		$data['enabled'] = true;

		/* Lets ensure we have in the cache */
		$data['count'] = \count( \IPS\Redis::i()->debugGetKeys( \IPS\Redis::i()->get( 'redisKey_store' ) . '_str_*', TRUE ) );
	}

	$datasource[] = $data;

	$data = array( 'type' => 'redis_cache', 'count' => NULL, 'enabled' => false );

	if ( \IPS\CACHE_METHOD == 'Redis' )
	{
		$data['enabled'] = true;

		/* Lets ensure we have something */
		$data['count'] = \count( \IPS\Redis::i()->debugGetKeys( \IPS\Redis::i()->get( 'redisKey' ) . '_*', TRUE ) );
	}

	$data = array( 'type' => 'redis_output_cache', 'count' => NULL, 'enabled' => false, 'pattern' => \IPS\Redis::i()->get( 'redisKeyOutputCache' ) . '*'  );

	if ( \IPS\OUTPUT_CACHE_METHOD == 'Redis' )
	{
		$data['enabled'] = true;

		/* Lets ensure we have something */
		$data['count'] = \IPS\Redis::i()->zCount('guest_page_created', '-inf', '+inf');;
		$data['cacheHits'] = \IPS\Redis::i()->zCount('guest_page_hits', '-inf', '+inf');
		$data['cacheFailure_crypt'] = \IPS\Redis::i()->zCount('guest_page_failures_decrypt', '-inf', '+inf');
		$data['cacheFailure_gzdecode'] = \IPS\Redis::i()->zCount('guest_page_failures_gz', '-inf', '+inf');
		$data['cacheFailure_json_decode'] = \IPS\Redis::i()->zCount('guest_page_failures_json_decode', '-inf', '+inf');
		$data['cacheFailure_key_gone'] = \IPS\Redis::i()->zCount('guest_page_failures_key_gone', '-inf', '+inf');

	}

	$datasource[] = $data;

	/* And now sessions */
	if ( \IPS\CACHE_METHOD == 'Redis' and \IPS\REDIS_ENABLED )
	{
		$datasource[] = array( 'type' => 'redis_sessions', 'count' => \count( \IPS\Redis::i()->debugGetKeys( 'session_id_*', TRUE ) ), 'enabled' => true );
		$datasource[] = array( 'type' => 'redis_topic_views', 'count' => \IPS\Redis::i()->zSize('topic_views'), 'enabled' => true );
	}
	else
	{
		$datasource[] = array( 'type' => 'redis_sessions'   , 'count' => NULL, 'enabled' => false );
		$datasource[] = array( 'type' => 'redis_topic_views', 'count' => NULL, 'enabled' => false );
	}
}

print_r( $datasource );
print_r( $info );


exit();