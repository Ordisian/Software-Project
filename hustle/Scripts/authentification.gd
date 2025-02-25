extends Control

## Variables
# Login screen
@onready var login_email: LineEdit = %LoginEmail
@onready var login_password: LineEdit = %LoginPassword
@onready var login_show_password_button: CheckButton = %LoginShowPasswordButton
@onready var login_button: Button = %LoginButton
@onready var login_remember_me: CheckButton = %LoginRememberMe

# Signup screen
@onready var signup_email: LineEdit = %SignupEmail
@onready var signup_password: LineEdit = %SignupPassword
@onready var signup_show_password_button: CheckButton = %SignupShowPasswordButton
@onready var signup_remember_me: CheckButton = %SignupRememberMe
@onready var signup_button: Button = %SignupButton

# Main screen
@onready var status: Label = %Status
@onready var sign_up: Button = %SignUp
@onready var login: Button = %Login
@onready var google_button: TextureButton = %GoogleButton
@onready var google_touch: TouchScreenButton = %GoogleTouch

# Welcome Screen
@onready var welcome_screen: MarginContainer = $WelcomeScreen
@onready var loading_label: Label = $WelcomeScreen/LoadingLabel

# Misc.
var port : int = 8060
const HUSTLE_MAIN = preload("res://Scenes/HustleMain.tscn")

func switch_to_hustle() -> void:
	# Show the WelcomeScreen as a loading screen
	$LoginScreen.visible = false
	$SignupScreen.visible = false
	$MainScreen.visible = false
	welcome_screen.visible = true
	loading_label.text = "Loading..."  # Update the loading message

	# Load the new scene in the background
	ResourceLoader.load_threaded_request("res://Scenes/HustleMain.tscn")

	# Check loading progress in a loop
	var progress = []
	while true:
		var status = ResourceLoader.load_threaded_get_status("res://Scenes/HustleMain.tscn", progress)
		if status == ResourceLoader.THREAD_LOAD_LOADED:
			break
		# Update the loading message with progress (optional)
		loading_label.text = "Loading... %d%%" % int(progress[0] * 100)
		await get_tree().process_frame  # Wait for the next frame

	# Get the loaded scene and switch to it
	var new_scene = ResourceLoader.load_threaded_get("res://Scenes/HustleMain.tscn")
	get_tree().change_scene_to_packed(new_scene)

func _ready() -> void:
	$LoginScreen.visible = false
	$SignupScreen.visible = false
	$MainScreen.visible = true
	
	Firebase.Auth.login_succeeded.connect(on_login_succeeded)
	Firebase.Auth.signup_succeeded.connect(on_signup_succeeded)
	Firebase.Auth.login_failed.connect(on_login_failed)
	Firebase.Auth.signup_failed.connect(on_signup_failed)
	
	if Firebase.Auth.check_auth_file():
		status.text = "Logged In!"
		switch_to_hustle()

func on_login_succeeded(auth) -> void:
	print(auth)
	status.text = "Login Succeeded!"
	Firebase.Auth.save_auth(auth)
	switch_to_hustle()

func on_login_failed(error_code, message) -> void:
	print(error_code)
	print(message)
	status.text = "Login Failed. Error: %s" % message

func on_signup_succeeded(auth) -> void:
	print(auth)
	status.text = "Sign Up Succeeded!"
	switch_to_hustle()

func on_signup_failed(error_code, message) -> void:
	print(error_code)
	print(message)
	status.text = "Sign Up Failed. Error: %s" % message

func _on_login_button_pressed() -> void:
	print("Login button pressed")
	var email = login_email.text
	var password = login_password.text
	Firebase.Auth.login_with_email_and_password(email, password)

func _on_signup_button_pressed() -> void:
	print("Signup button pressed")
	var email = signup_email.text
	var password = signup_password.text
	Firebase.Auth.signup_with_email_and_password(email, password)
	status.text = "Signing up..."

func _on_google_button_pressed() -> void:
	print("Google button pressed")
	google_auth()

func google_auth() -> void:
	var provider: AuthProvider = Firebase.Auth.get_GoogleProvider()
	Firebase.Auth.get_auth_localhost(provider, port)

func _on_login_pressed() -> void:
	$MainScreen.visible = false
	$LoginScreen.visible = true

func _on_sign_up_pressed() -> void:
	$MainScreen.visible = false
	$SignupScreen.visible = true

func _on_back_pressed() -> void:
	$MainScreen.visible = true
	$LoginScreen.visible = false
	$SignupScreen.visible = false

func _on_signup_show_password_button_toggled(toggled_on: bool) -> void:
	signup_password.secret = !toggled_on

func _on_login_show_password_button_toggled(toggled_on: bool) -> void:
	login_password.secret = !toggled_on

func _on_login_remember_me_toggled(toggled_on: bool) -> void:
	# Implement "Remember Me" functionality here
	pass

func _on_signup_remember_me_toggled(toggled_on: bool) -> void:
	# Implement "Remember Me" functionality here
	pass
