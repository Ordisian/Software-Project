extends Control

const COLLECTION_ID = "UserData"

func _ready() -> void:
	$Transitions.visible = true
	load_data()

# after 30 secs save data
func _on_auto_save_timeout() -> void:
	save_data()

func save_data() -> void:
	var auth = Firebase.Auth.auth
	if auth.localid:
		var collection: FirestoreCollection = Firebase.Firestore.collection(COLLECTION_ID)
		var data = {
			"fields": {
				"items":{
					"data_1" : 1,
					"data_2": 2
				}
			}
		}
		var document = FirestoreDocument.new()
		document.doc_name = auth.localid
		document.new_document(data)
		var task: FirestoreTask
		collection.update(document)

func load_data() -> void:
	var auth = Firebase.Auth.auth
	if auth.localid:
		var collection: FirestoreCollection = Firebase.Firestore.collection(COLLECTION_ID)
		var document = await collection.get_doc(auth.localid)
		
		if document:
			# Print the document data
			print(document)
