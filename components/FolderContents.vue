<template>
    <v-overlay :value="loading" v-if="loading">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <div class="folder-contents" v-else>
        <div class="upload-area">
            <ValidationProvider ref="provider" rules="ext:doc,pdf,xlsx,docx,jpg,png,gif,jpeg" name="Upload" v-slot="{ validate, errors }">
                <UiFilesUpload :singleImage="false" :subDir="subPath" :rootPath="jobid" :inlinePreviews="false" @sendPreviews="filePreviews($event)" :files="uploadFilesArr"
                   @afterUpload="afterUpload" :delimiter="delimiter" :path="folder" isStorage />
                <input type="hidden" v-model="uploadFilesArr" @click="validate" />
                <br />
                <span ref="uploadError" name="Upload" class="upload-area--error">{{ errors[0] }}</span>
            </ValidationProvider>
            <v-btn @click="editing = !editing" class="button--normal">Select files</v-btn>
            <v-btn @click.stop="deleteDialog = true" v-if="editing">Delete?</v-btn>
            <v-dialog v-model="deleteDialog" persistent max-width="400">
                <v-card>
                    <v-card-title class="headline">Are you sure you want to delete the selected files?</v-card-title>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="deleteDialog = false">No</v-btn>
                        <v-btn @click="deleteFiles">Yes</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <button class="button--normal button" @click="downloadFiles(`${folder}${subPath !== '' ? '-' + subPath : subPath}`)">Download current folder</button>
        </div>
        <div class="folder-contents__actions">
            <v-dialog v-model="createDirDialog" persistent max-width="500px" dark :value="false">
                <template v-slot:activator="{ on, attrs }">
                    <button class="button button--normal" v-bind="attrs" v-on="on">Create Folder</button>
                </template>
                <v-card>
                    <v-card-title><span class="text-h5">Create Folder</span></v-card-title>
                    <div class="form__form-group pl-5">
                        <ValidationProvider vid="folder" name="Folder name" v-slot="{errors, ariaMsg}" rules="required" class="form__input-group form__input-group--normal">
                            <label class="form__label" for="folder">Name of folder</label>
                            <input type="text" id="folder" class="form__input" v-model="folderName" />
                            <span class="form__input--error" v-bind="ariaMsg">{{ errors[0] }}</span>
                        </ValidationProvider>
                    </div>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="createDirDialog = false" :disabled="creating">Cancel</v-btn>
                        <v-btn text @click="folderCreation" :loading="creating">Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="moveDialog" persistent max-width="400">
                <template v-slot:activator="{on, attrs}">
                    <button v-bind="attrs" v-on="on" class="button button--normal" v-show="editing">Move?</button>
                </template>
                <div class="modal">
                    <div class="modal__content">
                        <label class="form__label">Where do you want to move the folder to?</label>
                        <div class="form__input-group" v-if="report.folders !== undefined">
                            <i class="form__select--icon icon--angle-down mdi" aria-label="icon"></i>
                            <select class="form__select" ref="selectFolder">
                                <option diabled value="">Please select a folder</option>
                                <option v-for="(item, i) in report.folders" :key="`folder-${i}`" :value="item.path">{{item.name}}</option>
                            </select>
                            <span class="form__input--error">{{errorMessage}}</span>
                        </div>
                    </div>
                    <div class="modal__footer">
                        <v-btn @click="moveFiles($refs.selectFolder.value)" :loading="moving">Move</v-btn>
                        <v-btn @click="moveDialog = false">Cancel</v-btn>
                    </div>
                </div>
            </v-dialog>
            <h4>{{actionSuccess}}</h4>
        </div>
        <div class="folder-contents__area">
            <nuxt-link class="folder-contents__content folder-contents__content--subfolder" v-for="(subfolder, i) in folders" :key="`subfolder-${i}`" :to="`/storage/${subfolder.path}`">
                <v-icon x-large>mdi-folder</v-icon>
                <p>{{subfolder.name}}</p>
            </nuxt-link>
            <!-- This displays the preview of the images about to be uploaded-->
            <div class="file-listing folder-contents__file-listing" v-for="(file, key) in uploadFilesArr" :key="`image-${key}`">
                <img v-if="file.file.type == 'application/pdf'" class="file-listing__preview" src="/pdf-icon.png" />
                <img v-if="file.file.type.includes('image')" class="file-listing__preview" :src="file.imageUrl" />
                <v-icon class="file-listing__remove-file" @click="removeFile(key)" tag="i" large>mdi-close-circle</v-icon>
                <p>{{file.name}}</p>
            </div>
            <UiLightbox v-if="images !== null" :selecting="editing" :images="images" :imagesPerPage="1" :dialog="sliderDialog">
                <template v-slot:image="slotProps">
                  <div class="folder-contents__item" :class="{'folder-contents__item--selected': selectedFiles.find(obj => obj.name === slotProps.image.name) && editing}">
                      <input type="checkbox" v-if="editing" :value="slotProps.image" v-model="selectedFiles" class="folder-contents__content--checkbox" />
                      <img class="folder-contents__content--image" :src="slotProps.image.imageUrl" />
                  </div>
                </template>
            </UiLightbox>
            <a class="folder-contents__content folder-contents__content--pdf" v-for="(pdf, i) in pdfs" :key="`pdf-${i}`" :href="pdf.imageUrl" target="_blank">
              <img src="/pdf-icon.png" alt="pdf icon" />
              <p>{{pdf.name}}</p>
            </a>
        </div>
    </div>
</template>
<script>
import JSZip from "jszip";
import { saveAs } from "file-saver";
import useReports from '@/composable/reports'
import axios from 'axios'
import { defineComponent, useContext, ref, toRefs, computed, watch, onMounted, useRoute } from '@nuxtjs/composition-api';
export default defineComponent({
  props: {
    jobid: String,
    folder: String,
    subPath: String,
    delimiter: String
  },
  setup(props, {refs}) {
    const route = useRoute()
    const { jobid, folder, subPath, delimiter } = toRefs(props)
    const { $api, $gcs, $auth } = useContext()
    const { getReportImagesPromise, report, images, folders, pdfs } = useReports()
    const subfolders = ref([])
    const uploadFilesArr = ref([])
    const uploading = ref(false)
    const uploaded = ref(false)
    const editing = ref(false)
    const selectedFiles = ref([])
    const errorMessage = ref("")
    const deleteDialog = ref(false)
    const moveDialog = ref(false)
    const loading = ref(false)
    const createDirDialog = ref(false)
    const folderName = ref("")
    const creating = ref(false)
    const moving = ref(false)
    const actionSuccess = ref("")
    const job = ref({})
    const sliderDialog = ref(false)
    const currentPath = computed(() => { 
      const splitPath = subPath.value.substring(subPath.value.indexOf('/', 1)+1, subPath.value.length).split('/').join('/')
      return splitPath
    })
  
    function afterUpload(param) {
      param.forEach(item => {
          let extension = item.name.substring(item.name.lastIndexOf('.'), item.name.length)
          if (extension == '.pdf') {
            pdfs.value.push(item)
            uploadFilesArr.value = []
          }
          if (extension == '.png' || extension == '.jpg' || extension == '.gif') {
            images.value.push(item)
          }
        })
      
    }
    const folderCreation = () => {
      const post = {
          folderPath: currentPath.value + folderName.value,
          storageBucket: process.env.defaultStorage,
          delimiter: "/",
          root: false
      }
      creating.value = true
      axios.post(`${process.env.functionsUrl}/create_folder`, post, {headers: {Authorization: `${$auth.strategy.token.get()}`}}).then((res) => {
        creating.value = false
        createDirDialog.value = false
        const newFolder = res.data.folders.find((obj) => {
          return obj.name.substring(obj.name.indexOf('/') + 1, obj.name.length) === folderName.value
        })
        if (report.value.folders == null) {
          report.value.folders = [newFolder]
        } else {
          report.value.folders.push(newFolder)
        }
      }).catch((err) => {
        errorMessage.value = err
        creating.value = false
      })
    }
    function moveFiles(destfolder) {
      if (destfolder === '') {
        errorMessage.value = "You must choose a destination folder"
        return
      }
      if (selectedFiles.value.length === 0) {
        errorMessage.value = "You must select images"
        return
      }
      const filesToMove = selectedFiles.value.map(el => {
        return el.name
      })
      const post = {
        sourceFiles: filesToMove,
        destFolder: destfolder
      }
      moving.value = true
      $gcs.$post(`/move`, post).then((res) => {
          actionSuccess.value = res
          moveDialog.value = false
          moving.value = false
          report.value.images = report.value.images.filter((el, i) => {
              return !selectedFiles.value.includes(el)
          })
      }).catch((err) => {
          moving.value = false
      })
    }
    async function downloadFiles(foldername) {
      const zip = new JSZip();
      const cache = {};
      const promises = [];
      const getFile = url => {
        return new Promise((resolve, reject) => {
          $api({
            url,
            responseType: "arraybuffer"
          }).then(res => {
            resolve(res.data)
          }).catch(err => {
            reject(err.toString())
          })
        })
      }
      report.value.images.forEach((file) => {
        const promise = getFile(file.imageUrl).then(data => {
          zip.file(file.name, data, {binary: true});
          cache[file.name] = data;
        });
        promises.push(promise);
      });
     
      Promise.all(promises).then(() => {
        zip.generateAsync({ type:"blob" }).then(content => {
          saveAs(content, `${foldername}.zip`)
        })
      })
    }
    function filePreviews(params) {
      uploadFilesArr.value = []
      params.forEach((item) => {
        uploadFilesArr.value.push(
          { file: item.file, name: item.file.name, imageUrl: item.imageUrl }
        )
      })
    }
    function removeFile(key) {
      uploadFilesArr.value.splice(key, 1);
    }
    function deleteFiles() {
      const filesToDelete = selectedFiles.value.map(obj => {
        return obj.name
      })
      $gcs.$post(`/delete-files`, {
          sourceFiles: filesToDelete
      }).then((res) => {
          actionSuccess.value = "Deleted images"
          deleteDialog.value = false
          let result = report.value.images.filter(obj1 => !selectedFiles.value.some(obj2 => obj1.name === obj2.name))
          report.value.images = result
      })
    }
    watch(() => report.value.images, (val) => {
      uploadFilesArr.value = []
    })
    getReportImagesPromise(jobid.value, folder.value, currentPath.value,  delimiter.value)
    return { 
      subfolders,
      uploadFilesArr,
      uploading,
      editing,
      selectedFiles,
      errorMessage,
      deleteDialog,
      loading,
      createDirDialog,
      folderName,
      creating,
      filePreviews,
      removeFile,
      downloadFiles,
      folderCreation,
      currentPath,
      actionSuccess,
      report,
      uploaded,
      moveDialog,
      moveFiles,
      moving,
      deleteFiles,
      job,
      afterUpload,
      sliderDialog,
      images,
      folders,
      pdfs
    }
  }
})
</script>
<style lang="scss">
.folder-contents {
  display: grid;
  grid-template-areas: "upload"
    "folder-actions"
    "items";
  grid-template-columns: 1fr;
  grid-template-rows:62px 50px 1fr;
  @include respond(tabletLarge) {
    grid-template-columns: 190px 1fr;
    grid-template-rows: 50px 1fr;
    grid-template-areas:"upload folder-actions"
      "upload items";
  }
  
  padding-top:20px;
  column-gap:20px;
  row-gap:26px;

  &__area {
    display:flex;
    flex-wrap:wrap;
    row-gap: 40px;
    column-gap: 40px;
    grid-area:items;
  }

  &__content {
    position: relative;
    width:145px;
    word-break: break-word;
    @include respond(tableLarge) {
      width:200px;
    }

    &--pdf {
      height:200px;
      img {
        object-fit:contain;
      }
    }

    p {
        word-break:break-word;
    }

    &--subfolder {
      display:inline-block;
      padding:5px;
      i {
        box-shadow:0 0 0 0;
        filter:drop-shadow(0px 0px 0px);
        transition:.3s filter ease;
      }
      &:hover {
        i {
          filter:drop-shadow(0px 0px 13px #e36868);
        }
      }
    }

    &--image {
      max-width: 240px;
      cursor:pointer;
    }

    &--file {
      display: flex;
      flex-direction: column;
      position: absolute;
      bottom: 0;
      width: 100%;
      text-align: center;
    }
    &--checkbox {
      width:100%;
      height:100%;
      appearance: none;
      position:absolute;
    }
  }

  &__pdf-link {
    background-image:url('/pdf-icon.png');
    width:100%;
    height:100%;
  }

  &__item {
    height:200px;
    display:block;
    position:relative;
    &--selected {
      border:20px ridge rgba($color-red, .8);
    }
  }

  &__actions {
    grid-area:folder-actions;
    column-gap:20px;
    display:flex;
  }
}
.upload-area {
  display:flex;
  grid-area:upload;
  &--error {
    color:$color-white;
  }
  @include respond(mobileLarge) {
    max-width:480px;
  }
  @include respond(tabletLargeMax) {
    justify-content:space-between;
  }
  @include respond(tabletLarge) {
    max-width:300px;
    flex-direction:column;
    height:260px;
  }
}
</style>