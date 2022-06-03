<template>
    <div>
        <div @click="launchFilePicker()" class="d-inline">
            <slot name="activator"></slot>
            <slot name="imagePreview" v-if="!multipleFiles" v-bind:image="previewImageUrl"></slot>
        </div>
        <input type="file" ref="file" @change="onFileChange($event.target.name, $event.target.files)" style="display:none;" :multiple="multipleFiles" />
        <v-dialog v-model="errorDialog" max-width="300">
            <v-card light class="pa-3">
                <p class="text">{{errorText}}</p>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn dark @click="errorDialog = false">Got it!</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
// USE THIS FOR SINGLE IMAGE UPLOADS
import { ref, toRefs } from '@nuxtjs/composition-api'
export default {
    props: {
        //value: Array,
        maxSize: Number,
        uploadFieldName: String,
        email: String,
        namechanged: String,
        multipleFiles: Boolean,
        additionalData: Object
    },
    setup(props, { root, refs, emit }) {
        const { maxSize, uploadFieldName, email, namechanged, multipleFiles, additionalData } = toRefs(props)
        const errorText = ref("");
        const previewImageUrl = ref("")
        const width = ref("");
        const errorDialog = ref(false)
        const launchFilePicker = () => {
            refs.file.click()
        }
        const onFileChange = (fieldName, file) => {
            let imageFile = file[0]
            
            if (!multipleFiles.value && imageFile !== undefined) {
                let size = imageFile.size / maxSize.value / maxSize.value
                if (namechanged.value !== undefined) {
                    var blob = imageFile.slice(0, imageFile.size, imageFile.type)
                    let filetype = ""
                    switch (imageFile.type) {
                        case "image/jpeg":
                            filetype = ".jpg"
                        case "image/png":
                            filetype = ".png"
                        default:
                            filetype = imageFile.name.substring(imageFile.name.lastIndexOf('.'), imageFile.name.length)
                    }
                    imageFile = new File([blob], `${namechanged.value}${filetype}`, {
                        type: imageFile.type
                    })
                    console.log(imageFile)
                }
                if (!imageFile.type.match('image.*')) {
                    errorDialog.value = true
                    errorText.value = 'Please upload an image file'
                } else if (size>1) {
                    errorDialog.value = true
                    errorText.value = 'Your file is too big!'
                } else {
                    var imagesArr = []
                    var formData = new FormData()
                    const imageUrl = URL.createObjectURL(imageFile)
                    const imageName = imageFile.name
                    previewImageUrl.value = imageUrl
                    if (additionalData.value !== undefined) {
                        formData.append("data", {...additionalData.value})
                    }
                    formData.append("single", imageFile)
                    
                    emit('getFiles', [{formData, ...additionalData.value, image: {imageUrl, imageName, image: imageFile}}])
                }
            } else if (multipleFiles.value) {
                var imagesArr = []
                var formData = new FormData()
                
                for (var i = 0; i < file.length; i++) {
                    let filetype = ""
                    switch (file[i].type) {
                        case "image/jpeg":
                            filetype = ".jpg"
                            break
                        case "image/png":
                            filetype = ".png"
                            break
                        default:
                            filetype = file[i].name.substring(file[i].name.lastIndexOf('.'), file[i].name.length)
                    }
                    var imageName = file[i].name.substring(0, file[i].name.indexOf('.')) + filetype
                    var imageUrl = URL.createObjectURL(file[i])
                    var blob = file[i].slice(0, file[i].size, file[i].type)
                    let newImageFile = new File([blob], imageName, {
                        type: file[i].type
                    })
                    imagesArr.push({imageUrl, imageName, image: newImageFile})
                }
                emit('getFiles', [{imagesArr}])
            } else {
                errorDialog.value = true
                errorText.value = "No image found"
            }
        }

        return {
            launchFilePicker,
            onFileChange,
            errorDialog,
            errorText,
            width,
            previewImageUrl
        }
    },
}
</script>