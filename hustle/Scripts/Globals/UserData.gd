extends Node

## This script handles user save data and settings, and stores them in the cloud

## This collection ID tells firebase where to store the data
const COLLECTION_ID = "UserData"

## Settings
var remember_login : bool

## Profile
var user_name : String = "TestBuild"

## Save Data
var user_save_data : Dictionary = {}
var first_time_opening_hustle : bool
var goals : Dictionary = {
	"example": {
		"completed": false,
		"description": "this is an example"
	}
}

func save_data() -> void:
	print("saving data")
	
	var auth = Firebase.Auth.auth
	if auth.localid:
		var collection: FirestoreCollection = Firebase.Firestore.collection(COLLECTION_ID)
		var user_save_data = {
			"User": {
				"Profile":{
					"user_name" : user_name,
					"data_2": 2,
				},
				"Settings":{
					"remember_login": remember_login,
				},
				"Save":{
					"has_opened_hustle_before": first_time_opening_hustle,
					"goals" : goals
				}
			}
		}
		var document = FirestoreDocument.new()
		document.doc_name = auth.localid
		document.new_document(user_save_data)
		var task: FirestoreTask
		collection.update(document)
		
		print(document)

func load_data() -> void:
	var auth = Firebase.Auth.auth
	if auth.localid:
		var collection: FirestoreCollection = Firebase.Firestore.collection(COLLECTION_ID)
		var document = await collection.get_doc(auth.localid)
		
		if document:
			# Print the document data
			print(document)
