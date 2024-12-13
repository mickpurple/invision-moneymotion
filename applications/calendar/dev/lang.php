<?php

$lang = array(
	'__app_calendar'						=> "Calendar",
	'frontnavigation_calendar'				=> "Calendar",
	'__indefart_calendar_event_comment'		=> "a comment on a calendar event",
	'__indefart_calendar_event'				=> "a calendar event",
	'__indefart_calendar_event_review'		=> "a review on a calendar event",
	'__defart_calendar_event_comment'		=> "comment on a calendar event",
	'__defart_calendar_event'				=> "calendar event",
	'__defart_calendar_event_review'		=> "review on a calendar event",
	'calendar_event_container'				=> "calendar",

	'menu__calendar_calendars'				=> "Calendar",
	'menu__calendar_calendars_calendars'	=> "Calendars",
	'menu__calendar_calendars_ical'			=> "iCalendar Feeds",
	'menu__calendar_calendars_settings'		=> "Settings",
	'module__calendar_calendar'				=> "Calendar",
	'module__calendar_calendars'			=> "Calendars",
	'module__calendar_events'				=> "Events",
	'menu__calendar_venues'					=> "Venues",
	'event'									=> "Event",
	'editor__calendar_Events'				=> "Calendar Events",
	'editor__calendar_Calendar'				=> "Calendars",
	'editor__calendar_Venue'				=> "Venues",
	'acp_search_title_calendar_Calendars'	=> "Calendars",
	'calendar_event_pl_lc'					=> "calendar events",
	'search_contextual_item_calendars'		=> "This Calendar",
	'search_contextual_item_calendar_event'	=> "This Event",

	/* !ACP Restrictions */
	'r__calendars'							=> "Calendars",
	'r__calendars_manage'					=> "Can manage calendars?",
	'r__calendars_add'						=> "Can add calendars?",
	'r__calendars_edit'						=> "Can edit calendars?",
	'r__calendars_permissions'				=> "Can manage calendar permissions?",
	'r__calendars_massManageContent'		=> "Can mass move/delete events in calendars?",
	'r__calendars_delete'					=> "Can delete calendars?",
	'r__ical'								=> "iCalendar Feeds",
	'r__calendar_feeds_manage'				=> "Can manage iCalendar feed imports?",
	'r__calendar_feeds_add'					=> "Can add iCalendar feed imports?",
	'r__calendar_feeds_edit'				=> "Can edit iCalendar feed imports?",
	'r__calendar_feeds_delete'				=> "Can delete iCalendar feed imports?",

	/* !Online User Locations */
	'loc_calendar_viewing_calendar'			=> "Viewing Calendar: %s",
	'loc_calendar_viewing_calendar_all'		=> "Viewing Calendar",
	'loc_calendar_viewing_event'			=> "Viewing Event: %s",
	'loc_calendar_viewing_calendar_action'	=> "%s is viewing a calendar",
	'loc_calendar_viewing_calendar_all_action' => "%s is viewing a calendar",
	'loc_calendar_viewing_event_action'		=> "%s is viewing an event",

	/* !Settings */
	'show_bday_calendar'					=> "Show birthdays on calendar",
	'show_bday_calendar_desc'				=> "When enabled, the calendar will show the number of member birthdays for each day and will list member birthdays when viewing a date.",
	'ipb_calendar_mon'						=> "Start calendar on Monday",
	'ipb_calendar_mon_desc'					=> "By default, the calendar will use Sunday as the start day for each week. You can use this setting to start the calendar on Monday instead.",
	'calendar_rss_feed'						=> "Enable upcoming events RSS feed",
	'calendar_rss_feed_desc'				=> "Only content that is available to guests will be shown. For more options, create a <a href='{internal.app=core&module=discovery&controller=rss}'>Custom RSS Feed</a>",
	'calendar_rss_feed_days'				=> "Number of forthcoming days to include in the feed",
	'calendar_rss_feed_order'				=> "Order feed by",
	'calendar_rss_feed_order_date'			=> "Event Date",
	'calendar_rss_feed_order_publish'		=> "Publish Date",
	'acplogs__calendar_settings'			=> "Updated calendar settings",
	'calendar_default_view'					=> "Default layout",
	'calendar_default_view_desc'			=> "This setting allows you to control the default layout of the calendar homepage. Users can override the default view if they wish.",
	'cal_df_month'							=> "Current month",
	'cal_df_week'							=> "Current week",
	'cal_df_day'							=> "Current day",
	'cal_df_stream'							=> "Stream of upcoming events",
	'filestorage__calendar_Events'			=> "Calendar Event Cover Photos",
	'calendar_df_locale'					=> "Use default date formatting",
	'calendar_df_d_sm_y'					=> "DD MMM YYYY (Example: 01 Jan 2000)",
	'calendar_df_d_lm_y'					=> "DD Month YYYY (Example: 01 January 2000)",
	'calendar_df_sm_d_y'					=> "MMM DD, YYYY (Example: Jan 01, 2000)",
	'calendar_df_lm_d_y'					=> "Month DD, YYYY (Example: January 01, 2000)",
	'calendar_custom_df'					=> "Or specify a custom date format",
	'calendar_date_format'					=> "Date format for events",
	'calendar_date_format_custom'			=> "Custom date format",
	'calendar_date_format_custom_desc'		=> "You can use any <a href='{external.php-strftime}' target='_blank' rel='noopener'>PHP strftime</a> options to specify a custom format for dates in calendar",
	'calendar_no_date_format'				=> "You must either choose a predefined date format or specify a custom date format",
	'calendar_block_past_changes'			=> "Prevent changes to past events",
	'calendar_block_past_changes_desc'		=> "If enabled, users will not be able to RSVP for events or edit events that have passed. Moderators will still be able to edit past events.",

	/* !Calendar Management */
	'calendars'								=> "Calendars",
	'calendars_sg'							=> "Calendar",
	'calendar_settings'						=> "Settings",
	'calendar_permissions'					=> "Permissions",
	'calendar_moderation'					=> "Moderation",
	'cal_title'								=> "Name",
	'cal_moderate'							=> "Events must be approved?",
	'cal_comment_moderate'					=> "Comments must be approved?",
	'cal_allow_comments'					=> "Allow comments?",
	'cal_allow_reviews'						=> "Allow reviews?",
	'cal_review_moderate'					=> "Reviews must be approved?",
	'calperm_perm__label'					=> "",
	'calperm_perm__view'					=> "See Calendar",
	'calperm_perm__read'					=> "View Events",
	'calperm_perm__add'						=> "Add Events",
	'calperm_perm__reply'					=> "Comment",
	'calperm_perm__askrsvp'					=> "Request RSVP",
	'calperm_perm__rsvp'					=> "RSVP",
	'calperm_perm__review'					=> "Review",
	'cal_color'								=> "Color",
	'add_calendar'							=> "Add Calendar",
	'edit_calendar'							=> "Edit Calendar",

	/* !Moderation */
	'modperms__core_Content_calendar_Event' => "Calendar",
	'calendar_calendars'					=> "Calendars",
	'can_pin_calendar_event'				=> "Can pin events?",
	'can_unpin_calendar_event'				=> "Can unpin events?",
	'can_feature_calendar_event'			=> "Can feature events?",
	'can_unfeature_calendar_event'			=> "Can unfeature events?",
	'can_move_calendar_event'				=> "Can move events?",
	'can_move_calendar_event_desc'			=> "Will be able to move events only between the calendars they can create new content within.",
	'can_lock_calendar_event'				=> "Can lock events?",
	'can_unlock_calendar_event'				=> "Can unlock events?",
	'can_reply_to_locked_calendar_event'	=> "Can comment on locked events?",
	'can_edit_calendar_event'				=> "Can edit events?",
	'can_hide_calendar_event'				=> "Can hide events?",
	'can_unhide_calendar_event'				=> "Can unhide events?",
	'can_view_hidden_calendar_event'		=> "Can view hidden events?",
	'can_delete_calendar_event'				=> "Can delete events?",
	'can_edit_calendar_event_comment'				=> "Can edit comments?",
	'can_hide_calendar_event_comment'				=> "Can hide comments?",
	'can_unhide_calendar_event_comment'				=> "Can unhide comments?",
	'can_view_hidden_calendar_event_comment'		=> "Can view hidden comments?",
	'can_delete_calendar_event_comment'				=> "Can delete comments?",
	'can_edit_calendar_event_review'				=> "Can edit reviews?",
	'can_hide_calendar_event_review'				=> "Can hide reviews?",
	'can_unhide_calendar_event_review'				=> "Can unhide reviews?",
	'can_view_hidden_calendar_event_review'		=> "Can view hidden reviews?",
	'can_delete_calendar_event_review'				=> "Can delete reviews?",
	'can_feature_comments_calendar_event'			=> "Can recommend comments on events?",
	'can_unfeature_comments_calendar_event'			=> "Can remove comments recommendations on events?",
	'can_add_item_message_calendar_event'			=> "Can add messages to events?",
	'can_edit_item_message_calendar_event'			=> "Can edit messages on events?",
	'can_delete_item_message_calendar_event'			=> "Can delete messages on events?",

	/* !iCalendar Management */
	'ical_title'							=> "iCalendar Feed Imports",
	'ical_feed_title'						=> "Title",
	'ical_feed_added'						=> "Added",
	'ical_feed_lastupdated'					=> "Last Updated",
	'ical_feed_calendar_id'					=> "Calendar",
	'ical_feed_url'							=> "URL",
	'calendar_feeds_add'					=> "Add iCalendar Feed",
	'calendar_feeds_upload'					=> "Upload iCalendar File",
	'update_ical'							=> "Import new events",
	'feed_title'							=> "Name",
	'feed_url'								=> "URL",
	'feed_url_desc'							=> "The URL should start with http://, https:// or webcal://",
	'feed_member_id'						=> "Member",
	'feed_member_id_desc'					=> "Events from this feed will be created by this member",
	'feed_calendar_id'						=> "Calendar",
	'feed_calendar_id_desc'					=> "Select the calendar that events from this feed will be saved to",
	'feed_allow_rsvp'						=> "Enable RSVP",
	'feed_allow_rsvp_desc'					=> "If enabled, RSVP will be enabled for all events imported from this feed",
	'acplog__ical_uploaded'					=> "Uploaded an iCalendar file (%s events imported and %s events skipped)",
	'acplog__icalfeed_created'				=> "Added %s iCalendar feed",
	'acplog__icalfeed_updated'				=> "Edited %s iCalendar feed",
	'feed_uploaded'							=> "iCalendar Events Imported",
	'acplog__icalfeed_refreshed'			=> "Refreshed iCalendar feed (%s events imported and %s events skipped)",
	'feed_refreshed'						=> "iCalendar Feed Refreshed",
	'feed_file'								=> "iCalendar File",
	'feed_file_desc'						=> "iCalendar files usually have a .ics extension",
	'feed_not_found'						=> "We could not find that iCalendar feed",
	'acplog__icalfeed_deleted'				=> "%s iCalendar feed deleted",
	'keep_events'							=> "Keep Events",
	'keep_events_desc'						=> "You can choose to remove events that were imported from this feed",
	'ical_error_NO_CONTENT'					=> "The feed appears to be invalid because no content was returned",
	'ical_error_BAD_CONTENT'				=> "The feed appears to be invalid because content not matching the expected format was returned",

	/* !Main calendar views (front end). Note that the title tags are abstracted so that other languages can define the %s replacement positions (e.g. %2$s %1$s). */
	'cal_month_title'						=> "%s %s",
	'cal_month_stream_title'				=> "Event stream for %s %s",
	'cal_week_title'						=> "%s %s %s - %s %s %s",
	'cal_week_title_wb'						=> "w/b %s %s %s",
	'cal_month_day'							=> "%s %s, %s",
	'cal_month_day_noyear'					=> "%s %s",
	'all_calendars'							=> "All Calendars",
	'create_event'							=> "Create Event",
	'select_calendar'						=> "Select Calendar",
	'add_event'								=> "Add event",
	'previous_month'						=> "Prev Month",
	'next_month'							=> "Next Month",
	'day'									=> "Day",
	'tomorrow'								=> "Tomorrow",
	'prev_day'								=> "Prev Day",
	'next_day'								=> "Next Day",
	'event_stream'							=> "Event Stream",
	'event_stream_short'					=> "Stream",
	'previous_week'							=> "Prev Week",
	'next_week'								=> "Next Week",
	'no_events_today'						=> "No events scheduled today",
	'no_events_month'						=> "No events scheduled this month",
	'error_bad_date'						=> "The date you requested appears to be invalid",
	'birthdays_today'						=> "{# [1:birthday][?:birthdays]} today",
	'birthdays_count'						=> "{# [1:birthday][?:birthdays]}",
	'birthdays_view_all'					=> "View all",
	'calendar_event'						=> "Event",
	'calendar_event_comment'				=> "Event Comment",
	'calendar_event_review'					=> "Event Review",
	'calendar_event_pl'						=> "Events",
	'calendar_event_comment_pl'				=> "Event Comments",
	'calendar_event_comment_pl_lc'			=> "event comments",
	'calendar_event_review_pl'				=> "Event Reviews",
	'calendar_event_review_pl_lc'			=> "event reviews",
	'event_review_count'					=> "{# [1:Review][?:Reviews]}",
	'event_comment_count'					=> "{# [1:Comment][?:Comments]}",
	'event_rsvp_attendees_list'				=> "{# [1:user has][?:users have]} RSVPed{!#[0: ][?:, including]}",
	'calendar_rss_title'					=> "Upcoming Events",
	'submit_event'							=> "Submit an event",
	'with_calendar'							=> "With '%s'",
	'with_all_calendars'					=> "With All Calendars",
	'event_calendar_id'						=> "Calendar",
	'event_container'						=> "Calendar",
	'event_title'							=> "Title",
	'event_ip_address'						=> "IP Address",
	'event_tags'							=> "Tags",
	'event_content'							=> "Description",
	'event_dates'							=> "Date",
	'rsvp'									=> "RSVP",
	'event_rsvp'							=> "Request RSVP",
	'event_rsvp_desc'						=> "Members who are allowed to RSVP for events will be asked to do so and will be able to see the list of members who have RSVP'd for this event. For recurring events, responses apply to all occurrences.",
	'event_to'								=> "to",
	'event_all_day'							=> "This is an all day event",
	'no_end_time'							=> "There is no end time",
	'event_repeat'							=> "Repeat",
	'change_timezone'						=> "Change the time zone",
	'event_timezone'						=> "Event Time Zone",
	'event_rpm_repeats'						=> "Repeats:",
	'event_rpm_repeats_daily'				=> "Daily",
	'event_rpm_repeats_weekly'				=> "Weekly",
	'event_rpm_repeats_monthly'				=> "Monthly",
	'event_rpm_repeats_yearly'				=> "Yearly",
	'event_rpm_repeatevery'					=> "Repeat every:",
	'event_rpm_repeatevery_day'				=> "days",
	'event_rpm_repeatevery_week'			=> "weeks",
	'event_rpm_repeatevery_month'			=> "months",
	'event_rpm_repeatevery_year'			=> "years",
	'event_rpm_repeaton'					=> "Repeat on:",
	'event_single_day'						=> "Single day event",
	'event_rpm_ends'						=> "Ends:",
	'event_rpm_ends_never'					=> "Never",
	'event_rpm_ends_afterx'					=> "After",
	'event_rpm_ends_occurrencesx'			=> "occurrences",
	'event_rpm_ends_date'					=> "On",
	'event_auto_follow'						=> "",
	'event_auto_follow_suffix'				=> "Follow this event",
	'event_rsvp_limit'						=> 'RSVP Limit',
	'event_rsvp_limit_desc'					=> "Once the limit is reached, no further attendees will be allowed to RSVP for this event.",
	'event_cover_photo'						=> "Cover Photo",
	'event_location'						=> "Location",
	'event_album'							=> "Album",
	'event_album_desc'						=> "You can link an album from the Gallery to this event which will show the images on the event page and cause information about the event to be displayed on the album page.",
	'submit_event_start'					=> "Event Start",
	'submit_event_end'						=> "Event End",
	'submit_event_summary'					=> "Summary",
	'submit_event_repeats_check'			=> "This event repeats",
	'submit_event_repeats'					=> "Repeats",
	'submit_event_remove_repeat'			=> "remove",
	'add_cal_event_header'					=> 'Add Calendar Event',
	'copy_cal_event'						=> "Copy Calendar Event",
	'copy_cal_event_header'					=> "Copy %s",
	'calendar_jump'							=> "Go",
	'calendar_jump_today'					=> "Go to today",
	'jump_to_placeholder'					=> "Jump to...",
	'jump_to'								=> "Jump to",
	'events_happening_today'				=> "Events happening today",
	'day_view_all_day'						=> "ALL<br>DAY",
	'you_are_going'							=> "You are going",
	'you_were_going'						=> "You went",
	'you_arent_going'						=> "You aren't going",
	'you_werent_going'						=> "You didn't go",
	'you_are_going_to_this'					=> "You are going to this event",
	'you_are_not_going_to_this'				=> "You are not going to this event",
	'rsvp_change'							=> "Change RSVP",
	'confirm_attendance'					=> "Confirm attendance",
	'featured_events'						=> "Featured Events",
	'end_date_before_start'					=> "The event must end after it starts",
	'invalid_start_date'					=> "The provided start date is not valid",
	'invalid_end_date'						=> "The provided end date is not valid",
	'invalid_recurrence'					=> "The event cannot repeat that frequently. Each occurrence must end before the next starts.",
	'event__save'							=> "Save",
	'calendar_delete_title'					=> "Delete this event",
	'blurb_date_with_time'					=> "%s %s",
	'blurb_start_and_end'					=> "%s - %s in %s",
	'blurb_start_only'						=> "%s in %s",

	/* !View event */
	'download_ical'							=> "Download Event",
	'download_ical_title'					=> "Download this event as an iCal file",
	'event_details'							=> "Event details",
	'event_created_by'						=> "Event created by %s",
	'event_rating_value'					=> "Your Rating",
	'event_review_text'						=> "Your Review",
	'event__review_placeholder'				=> "Add a review...",
	'event__comment_placeholder'			=> "Add a comment...",
	'event_submit_comment'					=> "Submit Comment",
	'event_rsvp_attendees'					=> "Attendees",
	'report_event'							=> "Report Event",
	'calendar_edit_details'					=> "Edit Details",
	'calendar_edit_details_title'			=> "Edit this event's details",
	'manage_event'							=> "Manage Event",
	'event_pending_approval'				=> "This event is not yet approved and is only visible to staff.",
	'rsvp_leave_event'						=> "Leave event",
	'rsvp_attend_event'						=> "Going",
	'rsvp_maybe_event'						=> "Maybe",
	'rsvp_notgoing_event'					=> "Decline",
	'rsvp_attendees'						=> "Going",
	'rsvp_attendees_past'					=> "Went",
	'rsvp_attended_past_event'				=> "Went",
	'rsvp_notattended_past_event'			=> "Could not attend",
	'rsvp_maybe_attendees'					=> "Maybe",
	'rsvp_notgoing_attendees'				=> "Declined",
	'event_address'							=> "Event Address",
	'add_similar_event'						=> "Add Similar Event",

	'no_rsvps_yet'							=> "No one is attending yet.",
	'no_decline_rsvps_yet'					=> "No one has declined yet.",
	'no_maybe_rsvps_yet'					=> "No one has said they might go yet.",

	'no_rsvps_past'							=> "No one went to this event.",
	'no_maybe_rsvps_past'					=> "No one said they might go.",
	'no_decline_rsvps_past'					=> "No one declined to attend.",
	'rsvp_limit_reached'					=> "RSVP limit reached",
	'no_rsvp_past_event'					=> "The event has already passed",
	'rsvp_error'							=> "You do not have permission to RSVP for this event",
	'rsvp_not_going'						=> "Your name has been removed from the guest list for this event",
	'rsvp_selection_yes'					=> "Your name has been added to the guest list",
	'rsvp_selection_no'						=> "It's too bad you won't be able to make it to the event!",
	'rsvp_selection_maybe'					=> "Your name has been added to the maybe list",
	'rsvp_download'							=> "Download guest list",
	'event_rsvp_attendees_other'			=> "Other Responses",
	'recur_human_yearly'					=> "This event {!#[1:began][2:begins]} %s and repeats every year %s",
	'recur_human_yearly_multi'				=> "This event {!#[1:began][2:begins]} %s and repeats every %s %s",
	'recur_human_monthly'					=> "This event {!#[1:began][2:begins]} %s and repeats every month %s",
	'recur_human_monthly_multi'				=> "This event {!#[1:began][2:begins]} %s and repeats every %s %s",
	'recur_human_weekly'					=> "This event {!#[1:began][2:begins]} %s and repeats every week %s",
	'recur_human_weekly_multi'				=> "This event {!#[1:began][2:begins]} %s and repeats every %s %s",
	'recur_human_weekly_days'				=> "This event {!#[1:began][2:begins]} %s and repeats every week on %s %s",
	'recur_human_weekly_multi_days'			=> "This event {!#[1:began][2:begins]} %s and repeats every %s on %s %s",
	'recur_human_daily'						=> "This event {!#[1:began][2:begins]} %s and repeats every day %s",
	'recur_human_daily_multi'				=> "This event {!#[1:began][2:begins]} %s and repeats every %s %s",
	'recur_human__forever'					=> "forever",
	'recur_human__occurrences'				=> "for {# [1:occurrence][?:occurrences]}",
	'recur_human__until'					=> "until %s",
	'recur_human__xyearly'					=> "{# [1:year][?:years]}",
	'recur_human__xmonthly'					=> "{# [1:month][?:months]}",
	'recur_human__xweekly'					=> "{# [1:week][?:weeks]}",
	'recur_human__xdaily'					=> "{# [1:day][?:days]}",
	'event_rss_feed_off'					=> "This RSS feed is currently unavailable",
	'event_rss_feed_off_admin'				=> "The calendar RSS feed is currently disabled in the admin control panel",
	'event_attendees'						=> "Attendees for %s",
	'rsvp_limit_info'						=> "{# [1:user has][?:users have]} RSVPed for this event. A total of %s can RSVP.",
	'rsvp_limit_nomaybe'					=> "You may only indicate you are going or not going when an event has a limit specified",
	'no_event_review'						=> "You do not have permission to review events",
	'task_BAD_CONTENT'						=> "The iCalendar feed %s is not correctly formatted in a recognized iCalendar format",
	'task_NO_CONTENT'						=> "The iCalendar feed %s did not return any events to process",
	'subscribe_webcal'						=> "Subscribe to iCalendar feed",
	'download_webcal'						=> "Download iCalendar export",
	'calendar_id'							=> "Calendar",
	'event_locked_can_comment'				=> "This event is locked, but your permissions allow you to add new comments.",
	'event_locked_cannot_comment'			=> "This event is now closed to further comments.",
	'event_images'							=> "Images from this event",
	'event_move_title'						=> "Move this event",
	'feature_title_event'					=> "Feature this event",
	'unfeature_title_event'					=> "Unfeature this event",
	'pin_title_event'						=> "Pin this event",
	'unpin_title_event'						=> "Unpin this event",
	'hide_title_event'						=> "Hide this event",
	'unhide_title_event'					=> "Unhide this event",
	'lock_title_event'						=> "Lock this event",
	'unlock_title_event'					=> "Unlock this event",
	'approve_title_event'					=> "Approve this event",
	'event_set_reminder'					=> "Set Reminder",
	'event_set_reminder_tip'				=> "Remind me when this event is approaching",
	'event_edit_reminder'					=> "Update Reminder",
	'event_dont_remind'						=> "Delete Reminder",
	'event_remind_me'						=> "Remind me",
	'event_remind_days_before'				=> "days before this event",
	'event_reminder_removed'				=> "Reminder Removed",
	'event_reminder_added'					=> "Reminder Saved",
	'no_edit_past_event'					=> "You do not have permission to edit past events",


	/* !Widgets */
	'block_upcomingEvents'					=> "Upcoming Events",
	'block_upcomingEvents_desc'				=> "Shows upcoming calendar events",
	'auto_hide'								=> "Automatically hide block",
	'auto_hide_desc'						=> "Hide this block when there are no results to display",
	'days_ahead'							=> "Number of days to show",
	'maximum_count'							=> "Number of events",
	'view_this_event'						=> "View the event %s",
	'block_todaysBirthdays'					=> "Today's Birthdays",
	'block_todaysBirthdays_desc'			=> "Shows birthdays from today",
	'no_members_birthday_today'				=> "No users celebrating today",
	'no_upcoming_events'					=> "No upcoming events found",
	'member_age'							=> "({# [1:year][?:years]} old)",
	'block_recentReviews'					=> "Recent Event Reviews",
	'block_recentReviews_desc'				=> "Display the most recent reviews",
	'no_recent_reviews'						=> "No recent reviews found",
	'announce_calendars'					=> "Calendars",
	'review_count'							=> 'Number of reviews to show',
	'widget_calendar'						=> "Calendar",
	
	'embed_calendar_event'					=> "Calendar Event",
	'x_users_going'							=> "{# [1:user][?:users]} going",

	'timezone_offset_short'					=> "GMT %s",
	'timezone_offset_-12'					=> "[GMT - 12] Baker Island Time",
	'timezone_offset_-11'					=> "[GMT - 11] Samoa Standard Time",
	'timezone_offset_-10'					=> "[GMT - 10] Hawaii Standard Time",
	'timezone_offset_-9.5'					=> "[GMT - 9:30] Marquesas Islands Time",
	'timezone_offset_-9'					=> "[GMT - 9] Alaska Standard Time",
	'timezone_offset_-8'					=> "[GMT - 8] Pacific Standard Time",
	'timezone_offset_-7'					=> "[GMT - 7] Mountain Standard Time",
	'timezone_offset_-6'					=> "[GMT - 6] Central Standard Time",
	'timezone_offset_-5'					=> "[GMT - 5] Eastern Standard Time",
	'timezone_offset_-4.5'					=> "[GMT - 4:30] Venezuelan Standard Time",
	'timezone_offset_-4'					=> "[GMT - 4] Atlantic Standard Time",
	'timezone_offset_-3.5'					=> "[GMT - 3:30] Newfoundland Standard Time",
	'timezone_offset_-3'					=> "[GMT - 3] Brasília time",
	'timezone_offset_-2'					=> "[GMT - 2] Fernando de Noronha Time",
	'timezone_offset_-1'					=> "[GMT - 1] Eastern Greenland Time",
	'timezone_offset_0'						=> "[GMT] Greenwich Mean Time",
	'timezone_offset_1'						=> "[GMT + 1] Central European Time",
	'timezone_offset_2'						=> "[GMT + 2] Eastern European Time",
	'timezone_offset_3'						=> "[GMT + 3] Eastern African Time",
	'timezone_offset_3.5'					=> "[GMT + 3:30] Iran Standard Time",
	'timezone_offset_4'						=> "[GMT + 4] Gulf Standard Time",
	'timezone_offset_4.5'					=> "[GMT + 4:30] Afghanistan Time",
	'timezone_offset_5'						=> "[GMT + 5] Pakistan Standard Time",
	'timezone_offset_5.5'					=> "[GMT + 5:30] Indian Standard Time",
	'timezone_offset_5.75'					=> "[GMT + 5:45] Nepal Time",
	'timezone_offset_6'						=> "[GMT + 6] Bangladesh Time",
	'timezone_offset_6.5'					=> "[GMT + 6:30] Myanmar Time",
	'timezone_offset_7'						=> "[GMT + 7] Indochina Time",
	'timezone_offset_8'						=> "[GMT + 8] Chinese Standard Time",
	'timezone_offset_9'						=> "[GMT + 9] Japan Standard Time",
	'timezone_offset_9.5'					=> "[GMT + 9:30] Australian Central Standard Time",
	'timezone_offset_10'					=> "[GMT + 10] Australian Eastern Standard Time",
	'timezone_offset_10.5'					=> "[GMT + 10:30] Lord Howe Standard Time",
	'timezone_offset_11'					=> "[GMT + 11] Solomon Island Time",
	'timezone_offset_11.5'					=> "[GMT + 11:30] Norfolk Island Time",
	'timezone_offset_12'					=> "[GMT + 12] New Zealand Time",
	'timezone_offset_12.75'					=> "[GMT + 12:45] Chatham Islands Time",
	'timezone_offset_13'					=> "[GMT + 13] Phoenix Islands Time",
	'timezone_offset_14'					=> "[GMT + 14] Line Island Time",
	
	/* !Tasks */
	'task__icalendar'						=> "Checks iCalendar feeds for new events and imports into Calendar.",
		
	/* !Digests */
	'digest_area_calendar_calendar'		=> "Events",
	'digest_area_calendar_event'		=> "Event",
	'x_created_event_in'	=> "%s posted an event in %s",
	'x_commented_event'		=> "%s commented on an event",
	'x_reviewed_event'		=> "%s reviewed an event",
	'digest_event_on'		=> "Event on",
	'digest_users_going'	=> "{# [1:user][?:users]} going",

	'mailsub__calendar_notification_new_content'=> '{$content->mapped("title")|raw}',
	'email_new_calevent_plain'			=> "%s has posted %s, %s, for %s",
	'email_new_calevent'				=> "<a href='%s'>%s</a> has posted %s, <a href='%s'>%s</a>, for %s",
	'email_new_calevent_guest'			=> "%s (Guest) has posted %s, <a href='%s'>%s</a>, for %s",
	
	/* !API */
	'__api_calendar_events'		=> "Events",
	'__api_calendar_comments'	=> "Comments",
	'__api_calendar_reviews'	=> "Reviews",
	'__api_calendar_calendars'	=> "Calendars",
	'__api_calendar_venues'		=> "Venues",

	/* Activity Stream */
	'calendar_activity_stream_rsvp'	=> "%s is attending <a href='%s'>%s</a>",
	'all_activity_calendar_streamitems' => "When a member RSVPs to an event",

	/* !Reminders */
	'notifications__calendar_Events'	=> "Event Reminders",
	'notifications__calendar_Events_desc'	=> "These notifications are sent when an event you have asked to receive a reminder about is coming up.",

	'mailsub__calendar_notification_event_reminder'	=> 'Event Reminder for {$content->mapped("title")|raw}',
	'email_event_reminder'				=> "There's now less than %s to go until <a href='%s'>%s</a>.",
	'email_event_reminder_plain'		=> "There's now less than %s to go until %s",
	'email_event_reminder_when'			=> "When: %s",
	'email_event_reminder_where'		=> "Where: %s",
	'days_to_go'	=> "{# [1:day][?:days]}",
	'notification__event_reminder'		=> "Less than %s to go until %s",

	/* !Venues */
	'menu__calendar_calendars_venues'		=> "Venues",
	'venues'								=> "Venues",
	'venue_title'							=> "Venue Name",
	'event_venue_name'						=> "Event Venue",
	'event_venue'							=> "Venue",
	'venues_not_listed'						=> "Venue not listed",
	'venue_address'							=> "Address",

	'r__venues'								=> "Venues",
	'r__venues_manage'						=> "Can Manage Venues",
	'module__venues_view'					=> "Venues",
	'editor__venues_Venue'					=> "Venue Description",

	'venue_description'						=> "Description",
	'calendar_venues_enabled'				=> "Enable Venues",
	'calendar_venues_enabled_desc'			=> "When enabled, administrators can create pre-defined venues that can be selected when creating events.",
	'calendar_more_events_at_x'				=> "More Events At This Venue",
	'venue_details'							=> "About the Venue",
	'venue_upcoming_events'					=> "Upcoming Events",
	'feed_venue_id'							=> "Venue",

	'event_new_venue'						=> "Save location as a new Venue?",
);
