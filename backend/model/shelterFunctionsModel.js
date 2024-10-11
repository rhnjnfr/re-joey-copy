import supabase from "../config/database.js";
import bcrypt from "bcrypt";
import multer from "multer"

const prefix = '/storage/v1/object/public/pets_images/';

//cloud storage used for saving images 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, date.now() + '-' + file.originalname);
    }
})

//newly logged in after shelter verificaion (adds a new address to the shelter)
export const addShelterAddress = async (req, res) => {
    try {
        const { address, latitude, longitude, id } = req.body
        const { data, err } = await supabase.rpc('insert_shelter_address',
            {
                _shelter_address: address,
                _lat: latitude,
                _lng: longitude,
                _shelterid: id

            })
        if (err) {
            console.log("Error:", err);
        } else {
            return res.status(200).json({
                "success": true
            });
        }

    } catch (err) {
        console.log("An error occurred while saving address", err);
        res.status(500).send("Server Error");
    }
};
//retrieves shelter profile details (tbl_shelter, tbl_shelter_details, tbl_shelter_link)
export const retrieveShelterDetails = async (req, res) => {
    try {
        const { shelterid } = req.body
        const { data, error } = await supabase.rpc('retrieve_shelter_details',
            {
                _shelterid: shelterid
            })
        if (error) {
            console.log("Error:", error);
        } else {
            return res.status(200).json(data);
        }
    }
    catch (err) {
        console.log("an error occured retrieving shelter details", err)
    }
}
//retrieves profile picture from cloud storage (bucket (images))
export const retrieveProfile = async (req, res) => {
    try {
        const { profileUrl } = req.body

        const { data: imageData, error } = supabase
            .storage
            .from('images')
            .getPublicUrl(profileUrl);

        if (error) {
            console.error('Error getting public URL:', error);
        } else {
            res.status(200).send({ data: imageData.publicUrl, message: "Shelter details saved successfully" });
        }
    }
    catch (err) {

    }
}
//save modified shelter details and links
export const saveShelter_and_Link = async (req, res) => {
    try {
        const { shelterid, sheltername, shelteraddress, image,
            contact, email, latitude, longitude, bio, links } = req.body;
        const file = req.file;
        let filePath = null

        // Check if the file is uploaded
        if (file) {
            filePath = `user_images/${Date.now()}_${file.originalname}`;

            // Upload file to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return res.status(500).send({ message: "File upload failed" });
            }
        }
        else {
            filePath = image
        }

        let linksArray;
        if (Array.isArray(links)) {
            // If links is already an array
            linksArray = links;
        } else if (typeof links === 'string') {
            try {
                // Try parsing if it's a JSON-formatted string
                const parsedLinks = JSON.parse(links);
                if (Array.isArray(parsedLinks)) {
                    linksArray = parsedLinks;
                } else {
                    // If parsing doesn't yield an array, treat it as a single link
                    linksArray = [links];
                }
            } catch (e) {
                // If parsing fails, assume it's a single link
                linksArray = [links];
            }
        } else {
            // If links is neither an array nor a string, default to an empty array
            linksArray = [];
        }

        let contactValue;
        if (contact === '') {
            contactValue = null; // Convert empty string to null
        } else if (typeof contact === 'string') {
            contactValue = parseInt(contact); // Convert string to integer
            if (isNaN(contactValue)) {
                contactValue = null; // Set to null if conversion fails
            }
        } else {
            contactValue = contact; // Leave as is if it's already a number
        }

        // Call the RPC function to update shelter details
        const { data: rpcData, error: rpcError } = await supabase.rpc('update_shelter_details', {
            _id: parseInt(shelterid, 10),
            _sheltername: sheltername,
            _address: shelteraddress,
            _lat: latitude,
            _lng: longitude,
            _contact: contactValue,
            _email: email,
            _profileurl: filePath, // store uploaded file path
            _bio: bio,
            _links: linksArray
        });

        if (rpcError) {
            console.error("Database insert error:", rpcError);
            return res.status(500).send({ success: false, message: "Failed to save shelter details" });
        }

        console.log("Database insert success");
        res.status(200).send({ success: true, message: "Shelter details saved successfully" });

    } catch (err) {
        console.log("Save Shelter Details and Link Error:", err);
        res.status(500).send({ message: "Internal server error" });
    }
};
//retrieve pet details and EVERYTHING KATUNG FOCKING 14??? TABLE QUERY
export const retrievePetProfile = async (req, res) => {
    const { _userid, _petid } = req.body

    try {
        const { data, error } = await supabase.rpc('retrieve_pet_profiles', {
            _user_id: _userid,
            _pet_id: _petid
        })
        if (error) {
            console.log("Error:", error);
        } else {
            return res.status(200).json(data);
        }
    }
    catch (err) {
        console.log("Error occured when retrieving pet profiles")
    }
}
//retrieve pet breed
export const retrievePetBreed = async (req, res) => {
    const { _category_id } = req.body
    try {
        const { data, err } = await supabase.rpc('retrieve_pet_breed', {
            _pet_type: _category_id
        })
        if (err) {
            console.log("Error:", err);
        } else {
            return res.status(200).json(data);
        }
    }
    catch (err) {
        console.log("error retrieving pet breed", err)
    }
}
//retrieve vaccine category
export const retrieveVaccineCategory = async (req, res) => {
    const { _category_id } = req.body
    try {
        const { data, err } = await supabase.rpc('retrieve_pet_vaccine', {
            _pet_type: _category_id
        })
        if (err) {
            console.log("Error:", err);
        } else {
            return res.status(200).json(data);
        }
    }
    catch (err) {
        console.log("error in retrieving vaccine", err)
    }
}
//retrieve sterilization
export const retrieveSterilization = async (req, res) => {
    const { _gender } = req.body
    try {
        const { data, err } = await supabase.rpc('retrieve_sterilization', {
            _gender: _gender
        })
        if (err) {
            console.log("Error:", err);
        } else {
            return res.status(200).json(data);
        }
    }
    catch (err) {
        console.log(err)
    }
}
//retrieve pet status
export const retrievePetStatus = async (req, res) => {
    try {
        const { data, err } = await supabase.rpc('retrieve_pet_status')
        if (err) {
            console.log("Error:", err);
        } else {
            return res.status(200).json(data);
        }
    }
    catch (err) {
        console.log("error retrieving pet status", err)
    }
}
//saving || used in create 
export const savepetprofie = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.files);

        let {
            id, gender, pet_category_id, other_pet_category, breed_id, other_breed,
            status, name, nickname, daterehomed, age, sizeweight, coat, about, special_needs,
            med_condition, vaccines = [], other_vaccines, other_sterilization, sterilization_id, energylevel
        } = req.body;

        if (sterilization_id == 'null') {
            sterilization_id = null
        }

        let pet_type = null;
        let pet_breed = null;

        if (pet_category_id !== 'Other') {
            pet_type = parseInt(pet_category_id, 10);
            pet_breed = parseInt(breed_id, 10);
        }

        const status_id = parseInt(status, 10);
        const sterilization_id_int = parseInt(sterilization_id, 10);
        const vaccine_ids = vaccines.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

        const files = req.files;

        // Upload Profile Photo
        const profileFile = files.find(file => file.fieldname === 'profile');
        const extraPhotos = files.filter(file => file.fieldname === 'extra_photo');

        if (breed_id == 'Other') {
            breed_id = null
        }

        let profileUrl = null;
        const extraPhotoUrls = [];

        if (profileFile) {
            const profileFilePath = `pets_profiles/${Date.now()}_${profileFile.originalname}`;
            const { data: profileUploadData, error: profileUploadError } = await supabase.storage
                .from('pets_images') // Ensure this is your correct bucket name
                .upload(profileFilePath, profileFile.buffer, {
                    contentType: profileFile.mimetype,
                });

            if (!profileUploadError) {
                const { data: profileUrlData } = supabase.storage
                    .from('pets_images')
                    .getPublicUrl(profileFilePath);
                profileUrl = profileUrlData.publicUrl;  // Profile photo URL
            } else {
                console.error('Profile upload error:', profileUploadError);
                return res.status(500).send({ message: "Failed to upload profile image." });
            }
        }

        // Upload Extra Photos
        for (const photo of extraPhotos) {
            const photoPath = `pets_photos/${Date.now()}_${photo.originalname}`;
            const { data: photoUploadData, error: photoUploadError } = await supabase.storage
                .from('pets_images') // Ensure this is your correct bucket name
                .upload(photoPath, photo.buffer, {
                    contentType: photo.mimetype,
                });

            if (!photoUploadError) {
                const { data: photoUrlData } = supabase.storage
                    .from('pets_images')
                    .getPublicUrl(photoPath);
                extraPhotoUrls.push(photoUrlData.publicUrl);  // Collecting extra photo URLs
            } else {
                console.error('Extra photo upload error:', photoUploadError);
                return res.status(500).send({ message: "Failed to upload extra photos." });
            }
        }

        // Ensure all required fields are present
        if (
            name && gender && status_id &&
            (pet_type || other_pet_category) &&
            (other_sterilization || sterilization_id_int)
        ) {
            const { data, error } = await supabase.rpc('insert_pet_data', {
                _about_pet: about,
                _age: age,
                _breed_id: pet_breed,
                _coat_fur: coat,
                _date_rehomed: daterehomed,
                _energy_level: energylevel,
                _gender: gender,
                _medical_condition: med_condition,
                _other_breed: other_breed,
                _other_pet_type: other_pet_category,
                _other_sterilization: other_sterilization,
                _other_vaccine: other_vaccines,
                _owner_id: id,
                _pet_extra_photos: extraPhotoUrls,
                _pet_name: name,
                _pet_nickname: nickname,
                _pet_profile_url: profileUrl,
                _pet_type: pet_type,
                _size_weight: sizeweight,
                _special_needs: special_needs,
                _status_id: status,
                _sterilization_id: sterilization_id,
                _vaccine_id: vaccines
            })

            if (error) {
                console.error("Database insert error:", error);
                return res.status(500).send({ message: "Failed to save image URLs to the database." });
            }
            else {
                console.log("saved successfully check db")
            }

            // Success response
            res.status(200).send({ message: "Pet profile and images saved successfully." });
        } else {
            if (toastRef.value) {
                toastRef.value.showToast('Error: Missing inputs');
            }
            return res.status(400).send({ message: "Error: Missing inputs." });
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).send({ message: "An unexpected error occurred." });
    }
};
//updating || used in edit
export const updatepetprofile = async (req, res) => {
    try {
        let {
            id, pet_id, gender, pet_category_id, other_pet_category, breed_id,
            other_breed, status, name, nickname, old_profile, daterehomed,
            energylevel, age, sizeweight, coat, about, special_needs, old_files,
            list_of_old_files, med_condition, other_vaccines, other_sterilization,
            sterilization_id, vaccines
        } = req.body
        const files = req.files;

        const photoToDelete = await comparePetExtraPhoto(old_files, list_of_old_files)

        // for (const file in req.files) {
        //     console.log(`File ${file}:`);
        //     console.log(req.files[file]);
        // }
        const profileFile = files.find(file => file.fieldname === 'new_profile');
        const extraPhotos = files.filter(file => file.fieldname === 'files');

        let fromDbExtraPhotosUrl = [old_files]
        let profileUrl = old_profile
        const extraPhotoUrls = [];
        let new_profile_path = null
        const old_profile_path = (new URL(old_profile).pathname).replace(prefix, '')

        if (profileFile) { //if true then save new profile to cloud and delete prev photo
            const profileFilePath = `pets_profiles/${Date.now()}_${profileFile.originalname}`;
            const { data: profileUploadData, error: profileUploadError } = await supabase.storage
                .from('pets_images') // Ensure this is your correct bucket name
                .upload(profileFilePath, profileFile.buffer, {
                    contentType: profileFile.mimetype,
                });

            if (!profileUploadError) {
                const { data: profileUrlData } = supabase.storage
                    .from('pets_images')
                    .getPublicUrl(profileFilePath);
                profileUrl = profileUrlData.publicUrl;  // Profile photo URL
                comparePetProfilePhoto(old_profile_path)
            } else {
                console.error('Profile upload error:', profileUploadError);
                return res.status(500).send({ message: "Failed to upload profile image." });
            }
        }

        comparePetExtraPhoto(old_files, list_of_old_files)

        for (const photo of extraPhotos) {
            const photoPath = `pets_photos/${Date.now()}_${photo.originalname}`;
            const { data: photoUploadData, error: photoUploadError } = await supabase.storage
                .from('pets_images') // Ensure this is your correct bucket name
                .upload(photoPath, photo.buffer, {
                    contentType: photo.mimetype,
                });

            if (!photoUploadError) {
                const { data: photoUrlData } = supabase.storage
                    .from('pets_images')
                    .getPublicUrl(photoPath);
                extraPhotoUrls.push(photoUrlData.publicUrl);  // Collecting extra photo URLs
            } else {
                console.error('Extra photo upload error:', photoUploadError);
                return res.status(500).send({ message: "Failed to upload extra photos." });
            }
        }

        if (Array.isArray(fromDbExtraPhotosUrl)) {
            fromDbExtraPhotosUrl.forEach(photo => {
                extraPhotoUrls.push(photo);
            });
        }

        if (other_vaccines === 'No vaccines recorded') {
            other_vaccines = null
        }

        // other_vaccines = other_vaccines == 'No vaccines recorded' ? null : other_vaccines

        if (vaccines !== null) {
            if (typeof vaccines === 'string') {
                // If it's a string, convert it to an array with one element
                vaccines = [Number(vaccines)];
            } else if (Array.isArray(vaccines)) {
                // If it's an array, map through it to convert all elements to numbers
                vaccines = vaccines.map(v => Number(v));
            }
        } else {
            // Handle the case where vaccines is null
            vaccines = null
        }
        console.log("vaccine", vaccines)

        const { data, err } = await supabase.rpc('update_animal_profile_details', {
            _pet_id: pet_id,
            _gender: gender,
            _pet_category_id: pet_category_id,
            _other_pet_category: other_pet_category,
            _breed_id: breed_id,
            _other_breed: other_breed,
            _status: status,
            _name: name,
            _nickname: nickname,
            _daterehomed: daterehomed,
            _energylevel: energylevel,
            _age: age,
            _size_weight: sizeweight,
            _coat: coat,
            _about: about,
            _special_needs: special_needs,
            _med_condition: med_condition,
            _other_vaccines: other_vaccines,
            _vaccines: vaccines,
            _other_sterilization: other_sterilization,
            _sterilization_id: sterilization_id === 'null' ? null : sterilization_id,
            _profile_photo: profileUrl,
            _photo_url_to_delete: photoToDelete,
            _photo_url: extraPhotoUrls,
        })
        if (err) {
            console.log("Error:", err);
        } else {
            // return res.status(200).json(data);
            console.log("saved. . . check db")
            console.log(data)
        }
        console.log("RPC Data:", data);
        console.log("RPC Error:", err);

    }
    catch (err) {
        console.log("an error occured when updating", err)
    }
}
const comparePetProfilePhoto = async (oldPhoto) => {
    console.log(oldPhoto)
    const { data, error } = await supabase
        .storage
        .from('pets_images')
        .remove([oldPhoto]);

    if (error) {
        console.error('Error deleting file:', error);
    } else {
        console.log('File deleted successfully:', data);
    }
}
const comparePetExtraPhoto = async (newPhotos, oldPhotos) => {

    let newPhotosArray = Array.isArray(newPhotos) ? newPhotos : [newPhotos];
    let oldPhotosArray = Array.isArray(oldPhotos) ? oldPhotos : [oldPhotos];

    let filesToDelete = oldPhotosArray.filter(file => !newPhotosArray.includes(file));

    if (!filesToDelete) {
        filesToDelete = filesToDelete.map(file => (new URL(file).pathname).replace(prefix, ''));
        // Ensure filesToDelete is an array and remove those files from Supabase storage
        const { data, error } = await supabase
            .storage
            .from('pets_images')
            .remove(filesToDelete); // Pass array directly

        if (error) {
            console.error('Error deleting file:', error);
        } else {
            console.log('Files deleted successfully:', data);
        }
    }

    return filesToDelete
}
export default addShelterAddress;