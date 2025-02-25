extends Control

func _ready() -> void:
	$Timers/AutoSave.start()
	
	$Transitions.visible = true
	UserData.load_data()
	
	if UserData.first_time_opening_hustle:
		UserData.save_data()
		UserData.first_time_opening_hustle = false

# after 10 secs save data
func _on_auto_save_timeout() -> void:
	UserData.save_data()
	# possible could be too many requests
