extends Button

func _on_pressed() -> void:
	Firebase.Auth.logout()
	get_tree().change_scene_to_file("res://Scenes/authentication.tscn")
