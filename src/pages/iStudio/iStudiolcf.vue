<template>
    <div style="overflow:auto;">
      <q-form ref="formICF">
        <div class="col-md-6 col-xl-6 col-sm-6 col-xs-12 q-pa-xs text-subtitle1">
          <q-card flat bordered>
            <q-card-section>
              <div class="col-md-6 col-xs-12">
                <div class="text-subtitle1 text-bold q-py-xs">
                  {{ $t('itrack.ideaTitle') }}
                </div>
                <q-input
                  square
                  outlined
                  autogrow
                  class="text-subtitle1"
                  v-model="formData.title"
                  :rules="[
                    val => !!val || $t('iworkshop.enterIdeaTitle'),
                    val => (val && val.length) <= 120 || $t('iworkshop.lessThan', { var: $t('iworkshop.enterIdeaTitle'), count: '120' }),
                    (val) => xssCheck(val, 'text')
                  ]"
                />
              </div>
  
              <q-bar style="height:30px" class="bg-primary text-white q-mt-md">
                <q-icon size="sm" name="backup" />
                <q-item-label
                  v-if="($q.platform.is.desktop || $q.platform.is.ipad)"
                  class="text-subtitle1 text-bold"
                >{{ 'Upload idea Images' }}</q-item-label>
              </q-bar>
  
              <q-card-actions class="q-gutter-md q-mt-xs col-md-6 col-xs-12">
                <div v-for="(file, index) in getCurrentPicture" :key="`${file.orignalName}_${index}`">
                  <img-preview
                    v-if="file && getCurrentPicture.length"
                    class="example"
                    :value="file"
                    :remove="false"
                    :show-name="false"
                    @removeImage="onRemoveFileFromChild(1)"
                  />
                </div>
  
                <div v-for="(file, index) in getAfterPicture" :key="`${file.orignalName}_${index}`">
                  <img-preview
                    v-if="file && getAfterPicture.length"
                    class="example"
                    :value="file"
                    :remove="false"
                    :show-name="false"
                    @removeImage="onRemoveFileFromChild(2)"
                  />
                </div>
  
                <div v-for="(file, index) in getRefPicture" :key="`${file.orignalName}_${index}`">
                  <img-preview
                    v-if="file && getRefPicture.length"
                    :value="file"
                    :remove="true"
                    @removeImage="onRemoveFileFromChild(3, index)"
                  />
                </div>
              </q-card-actions>
  
              <q-bar style="height:30px" class="bg-primary text-white q-mt-md">
                <q-icon size="sm" name="backup" />
                <q-item-label
                  v-if="($q.platform.is.desktop || $q.platform.is.ipad)"
                  class="text-subtitle1 text-bold"
                >{{ 'New photos' }}</q-item-label>
              </q-bar>
  
              <q-card-actions class="q-gutter-md q-mt-xs col-md-6 col-xs-12">
                <q-uploader
                  flat
                  multiple
                  bordered
                  :url="url"
                  color="grey-3"
                  icon="shuffle"
                  :method="method"
                  :accept="accept"
                  :headers="headers"
                  text-color="primary"
                  :field-name="fieldName"
                  v-if="rerenderComponent"
                  style="max-width: 300px;max-height: 150px"
                  @added="uploadedSketchImage"
                >
                  <template #header="{ removeQueuedFiles, uploadedFiles, isUploading, upload, abort }">
                    <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                      <q-btn
                        v-if="getAudio.length"
                        icon="clear_all"
                        round
                        dense
                        flat
                        @click="removeQueuedFiles"
                      >
                        <q-tooltip>{{ $t("common.clearAll") }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="uploadedFiles.length > 0"
                        icon="done_all"
                        round
                        dense
                        flat
                        @click="removeUploadedFiles"
                      >
                        <q-tooltip>{{ 'Upload mockups' }}</q-tooltip>
                      </q-btn>
                      <q-spinner v-if="isUploading" class="q-uploader__spinner" />
                      <div class="col">
                        <div class="q-uploader__title">{{ 'Upload mockups' }}</div>
                      </div>
                      <q-btn round type="a" color="primary" icon="burst_mode">
                        <q-uploader-add-trigger />
                        <q-tooltip>{{ `${$t("common.pick")} ${$t("common.files")}` }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="cloud_upload"
                        style="display: none"
                        round
                        dense
                        flat
                        @click="upload"
                      >
                        <q-tooltip>{{ `${$t("common.upload")} ${$t("common.files")}` }}</q-tooltip>
                      </q-btn>
  
                      <q-btn
                        v-if="isUploading"
                        icon="clear"
                        @click="abort"
                        round
                        dense
                        flat
                      >
                        <q-tooltip>{{ `${$t("common.abort")} ${$t("common.upload")}` }}</q-tooltip>
                      </q-btn>
                    </div>
                  </template>
  
                  <template #list>
                    <div v-for="(file, index) in getAudio" :key="index">
                      <img-preview
                        v-if="file && getAudio.length"
                        :showPreview="false"
                        :value="file"
                        :remove="true"
                        @removeImage="onRemoveFileFromChild(4, index)"
                      />
                    </div>
                  </template>
                </q-uploader>
              </q-card-actions>
  
              <q-bar style="height:30px" class="bg-primary text-white q-mt-md">
                <q-icon size="sm" name="backup" />
                <q-item-label
                  v-if="($q.platform.is.desktop || $q.platform.is.ipad)"
                  class="text-subtitle1 text-bold"
                >{{ 'Studio Space' }}</q-item-label>
              </q-bar>
  
              <q-card-actions class="q-mt-xs offset-md-4 col-md-8 col-xs-12">
                <vue-image-markup />
              </q-card-actions>
            </q-card-section>
  
            <q-separator />
  
            <q-card-actions class="q-mt-md">
              <q-space />
              <q-btn
                square
                outlined
                class="text-subtitle1"
                color="primary"
                size="md"
                icon="save"
                unelevated
                no-caps
                :label="$t('common.submit')"
                @click="saveIdeasToiLake"
              />
              <q-btn
                square
                size="md"
                icon="highlight_off"
                v-if="Object.entries(idea).length == 0"
                outlined
                unelevated
                color="grey-5"
                class="text-subtitle1"
                no-caps
                :label="$t('common.cancel')"
                to="/icap"
              />
              <q-btn
                square
                size="md"
                icon="highlight_off"
                v-if="Object.entries(idea).length"
                color="grey-5"
                unelevated
                class="text-subtitle1"
                no-caps
                :label="$t('common.cancel')"
                @click="restFormData()"
                v-close-popup
              />
  
              <q-space />
            </q-card-actions>
          </q-card>
        </div>
      </q-form>
    </div>
  </template>

<script>
import { ref, reactive, computed } from 'vue';
import fullscreen from 'vue-fullscreen';
import { useStore } from 'vuex';
import { getCompresedFile } from "@/utils/imageCompress";
import { onMounted} from 'vue';
import { cloneDeep, forEach, isEmpty, map, merge } from 'lodash';

export default {
  props: {
    wk: {
      type: Object,
      default: () => ({}),
    },
    idea: {
      type: Object,
      default: () => ({}),
    },
    bulkAdd: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'vue-image-markup': () => import('./VueImageMarkup'),
    'img-preview': () => import('components/Uploader/preview.vue'),
    // imageUploader: () => import('components/Uploader/quasarUploader.vue'),
    // productWsSelector: () => import('components/common/productWsSelector.vue')
  },
  setup(props) {
    const store = useStore();
    
    const editor = ref({});
    const canvasId = 'studio-space';
    const fullscreen = ref(false);
    
    const headers = [
      { name: "x-tenant", value: localStorage.getItem("tenant") },
      { name: "authorization", value: `Bearer ${localStorage.getItem("authorization")}` },
      { name: "x-feathers-jwt", value: `Bearer ${localStorage.getItem("vtl2.0")}` },
    ];
    
    const url = `${process.env.API_BASE_URL}/uploads`;
    const method = "POST";
    const accept = "image/png,image/gif,image/jpeg,image/webp";
    const fieldName = "files";
    
    const triggerSaveFunctionCallCount = ref(0);
    const fileCount = ref(0);
    const lorem = "Lorem ipsum ";
    const text = ref("");
    const varApplicationId = ref("");
    const varModelName = ref([]);
    const aggregates = ref([]);
    const subAggregates = ref([]);
    const parts = ref([]);
    const startDate = ref("");
    const endDate = ref("");
    const mobile = ref("");
    
    const formData = reactive({
      ideaNum: "",
      chargeCode: { _id: props.wk.chargCodeId },
      workshop: {
        _id: props.wk._id,
        workshopCode: props.wk.workshopCode,
        name: props.wk.workshopCode,
      },
      level: { _id: "", name: "" },
      tag: "icf",
      origin: 'icf',
      productId: null,
      aggregateId: null,
      subAggregateId: null,
      partName: null,
      primVariable: [],
      secVariable: [],
      title: "",
      description: "",
      audio: [],
      currentPicture: [],
      afterPicture: [],
      refPicture: [],
      pedningFunc: null,
    });
    
    const rerenderComponent = ref(true);
    const ideaCount = ref(0);
    const events = ref([]);

    // Add any computed properties or methods here if needed

    return {
      editor,
      canvasId,
      fullscreen,
      headers,
      url,
      method,
      accept,
      fieldName,
      triggerSaveFunctionCallCount,
      fileCount,
      lorem,
      text,
      varApplicationId,
      varModelName,
      aggregates,
      subAggregates,
      parts,
      startDate,
      endDate,
      mobile,
      formData,
      rerenderComponent,
      ideaCount,
      events,
    };
  },
};

const user = computed(() => store.getters['VTL/user']);
const getSelChargeCode = computed(() => store.getters['VTL/getSelChargeCode']);
const ideaIcfCount = computed(() => store.getters['idea/ideaIcfCount']);
const ideaCreated = computed(() => store.getters['idea/created']);

const ideaTotalCount = computed(() => ideaIcfCount.value);

const formData = reactive({
  currentPicture: '', // Initialize with your actual data
  afterPicture: '',   // Initialize with your actual data
  refPicture: '',     // Initialize with your actual data
  audio: '',          // Initialize with your actual data
});

const getCurrentPicture = computed(() => formData.currentPicture);
const getAfterPicture = computed(() => formData.afterPicture);
const getRefPicture = computed(() => formData.refPicture);
const getAudio = computed(() => formData.audio);

const mobile = ref(false);
const isMobile = computed({
  get: () => mobile.value,
  set: (val) => { mobile.value = val; },
});

const ideaCountQuery = computed(() => ({
  $limit: 0,
  "chargeCode._id": getSelChargeCode.value,
  $or: [{ deletedAt: null }, { deletedAt: { $ne: null } }],
}));

const findIdea = () => {
  const query = ideaCountQuery.value;
  return store.$api.Idea.findInStore({ query });
};

watch(ideaCreated, (newValue) => {
  if (newValue) {
    ideaCreatedEvent(this, newValue);
  }
});

const wk = cloneDeep(wk);
mobile.value = ref(window.screen.width <= 767);
formData.value = reactive({
  primVariable: [],
  secVariable: [],
  // Initialize other properties as needed...
});

const handleResize = () => {
  mobile.value = window.screen.width <= 767;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);

  if (wk.icfConfig) {
    if (formData.primVariable.length !== wk.icfConfig.primVariable.length) {
      for (let i = 0; i < wk.icfConfig.primVariable.length; i++) {
        formData.primVariable.push({
          _id: "",
          name: "",
          value: (wk.icfConfig.primVariable[i].dataType === "multiple") ? [] : "",
          seq: wk.icfConfig.primVariable[i].seq,
          unit: wk.icfConfig.primVariable[i].unit,
        });
      }
    }

    if (formData.secVariable.length !== wk.icfConfig.secVariable.length) {
      for (let i = 0; i < wk.icfConfig.secVariable.length; i++) {
        formData.secVariable.push({
          _id: "",
          name: "",
          value: (wk.icfConfig.secVariable[i].dataType === "multiple") ? [] : "",
          seq: wk.icfConfig.secVariable[i].seq,
          unit: wk.icfConfig.secVariable[i].unit,
        });
      }
    }
  }
});

wk.value = cloneDeep(wk);

onMounted(() => {
  // this.$refs.editor.set('arrow')
  // this.$refs.editor.set('selectMode')
  // this.$refs.editor.set(this.editor.mode, this.editor.options)
  // let textModeOptions = { id: 'title', fill: 'red', fontFamily: 'Verdana', fontSize: 16, placeholder: 'Type something' }
  // this.$refs.editor.set('text', textModeOptions)

  if (idea._id) {
    formData = idea;
    const fields = ['aggregateId', 'subAggregateId', 'partName'];

    forEach(fields, (field) => {
      if (!isEmpty(formData[field])) {
        if (formData[field] && !formData[field]._id) {
          formData[field] = null;
        }
      }
    });

    removePlaceholderImage();

    formData.primVariable = map(
      merge(wk.icfConfig.primVariable, formData.primVariable),
      (primVar) => {
        if (primVar?.dataType === 'multiple') {
          primVar['value'] = Array.isArray(primVar['value'])
            ? primVar['value']
            : [primVar?.value || ''];
        }
        return primVar;
      }
    );

    formData.secVariable = map(
      merge(wk.icfConfig.secVariable, formData.secVariable),
      (secVar) => {
        if (secVar?.dataType === 'multiple') {
          secVar['value'] = Array.isArray(secVar['value'])
            ? secVar['value']
            : [secVar?.value || ''];
        }
        return secVar;
      }
    );
  }

  if (ideaIcfCount.value) {
    ideaCount = ideaIcfCount.value;
  } else {
    getIdeaCount();
  }
});



 onUnmounted(() => {
      restFormData();
      emit('icf-destroyed');
    });

    const setProduct = (val) => {
      formData.value.productId = val;
    };

    const setAggregate = (val) => {
      formData.value.aggregateId = val;
    };

    const setSubAggregate = (val) => {
      formData.value.subAggregateId = val;
    };

    const setPart = (val) => {
      formData.value.partName = val;
    };

    const ideaCreatedEvent = (idea) => {
      if (idea) ideaCount.value += 1;
    };

    const getIdeaCount = async () => {
      const query = { ...ideaCountQuery, "x-tenant": localStorage.getItem("tenant") };
      const res = await useApi().Idea.find({ query });
      if (res) {
        ideaCount.value = res.total;
      }
    };

    const reRender = () => {
      rerenderComponent.value = false;
      nextTick(() => {
        rerenderComponent.value = true;
      });
    };

    const uploadFile = async (file) => {
      toggleSpinner(true);
      const form = await getCompresedFile(file);
      try {
        const res = await axios.post("/uploads", form, {
          headers: {
            "x-tenant": localStorage.getItem("tenant"),
            "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
            authorization: `Bearer ${localStorage.getItem("authorization")}`,
          },
        });
        await uploaded({ xhr: res.request, files: res.data }, true);
      } finally {
        toggleSpinner(false);
      }
    };

    const uploaded = async (info) => {
      const { xhr } = info;
      const response = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;

      if (response.length) {
        await triggerSave(response[0], 3);
      }
    };

    const uploadCurrentPicture = async (file) => {
      toggleSpinner(true);
      const form = await getCompresedFile(file);
      try {
        const res = await axios.post("/uploads", form, {
          headers: {
            "x-tenant": localStorage.getItem("tenant"),
            "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
            authorization: `Bearer ${localStorage.getItem("authorization")}`,
          },
        });
        formData.value.currentPicture = res.data.map((img) => {
          img.newNameWithPath = img.newNameWithPath;
          return img;
        });
      } finally {
        toggleSpinner(false);
      }
    };

    const uploadAfterPicture = async (file) => {
      toggleSpinner(true);
      const form = await getCompresedFile(file);
      try {
        const res = await axios.post("/uploads", form, {
          headers: {
            "x-tenant": localStorage.getItem("tenant"),
            "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
            authorization: `Bearer ${localStorage.getItem("authorization")}`,
          },
        });
        formData.value.afterPicture = res.data.map((img) => {
          img.newNameWithPath = img.newNameWithPath;
          return img;
        });
      } finally {
        toggleSpinner(false);
      }
    };

    const padLeft = (nr, n, str) => {
      return Array(n - String(nr).length + 1).join(str || "0") + nr;
    };

    const saveIdeasToiLake = async () => {
      const status = await refs.formICF.validate();
      if (!bulkAdd.value) {
        formData.value.secVariable.forEach((x, index) => {
          if (x && wk.icfConfig.secVariable[index]) {
            x._id = wk.icfConfig.secVariable[index]._id;
            x.name = wk.icfConfig.secVariable[index].name;
            x.unit = wk.icfConfig.secVariable[index]?.unit?.name || null;
          }
        });

        formData.value.primVariable.forEach((x, index) => {
          if (x && wk.icfConfig.primVariable[index]) {
            x._id = wk.icfConfig.primVariable[index]._id;
            x.name = wk.icfConfig.primVariable[index].name;
            x.unit = wk.icfConfig.primVariable[index]?.unit?.name || null;
          }
        });
      }
      // Set level based on formData
      // ... [Rest of your level setting logic]

      if (formData.value && status) {
        const query = {
          $limit: 0,
          "chargeCode._id": getSelChargeCode,
          $or: [{ deletedAt: null }, { deletedAt: { $ne: null } }],
          'x-tenant': localStorage.getItem("tenant"),
        };
        
        const ideaCountCallback = async () => {
          let cloneData = _.cloneDeep(formData.value.secVariable);
          formData.value.saving = cloneData.filter((x) => x.name === "Saving").map((v) => _.toNumber(v.value))[0];
          const msg = formData.value._id ? $t("itrack.ideaUpdateSuccess") : $t("itrack.ideaAddedSuccess");

          toggleSpinner(true);
          removePlaceholderImage();
          var tempIdea = _.cloneDeep(formData.value);
          
          const callback = (res) => {
            toggleSpinner(false);
            const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio'];
            media.forEach((field) => {
              res[field] = _.merge(tempIdea[field], res[field]);
            });
            nextTick(() => {
              emit('idea-saved', res);
              if (res) {
                $q.notify(msg);
                store.commit('idea/updateItem', _.merge(tempIdea, res));
                restFormData();
                const event = formData.value._id ? 'ideaPatchedEvent' : 'ideaCreatedEvent';
                emit(event, _.merge(tempIdea, res));
              } else {
                $q.notify(error.message);
              }
            });
          };

          if (user.value.role === "Super Admin" && localStorage.getItem("tenant") === process.env.DEFAULT_TENANT) {
            $q.notify({
              type: "warning",
              message: "Super admin don't have permission to do this operation!",
            });
            return;
          }

          removeBase64Image();

          new useApi().Idea(formData.value)
            .save({ query: { isExcelUI: false } })
            .then(callback);
        };

        if (!formData.value._id) {
          let ideaNumber = padLeft(1, 5);
          formData.value.ideaNum = `IWksp_${ideaNumber}`;
          ideaCountCallback();
        } else {
          ideaCountCallback();
        }
      } else {
        $q.notify($t("common.recordNotSaved"));
      }
    };

    const removePlaceholderImage = () => {
      const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio'];
      media.forEach((field) => {
        formData.value[field] = _.reject(formData.value[field], { orignalName: "placeholder.jpg" });
      });
    };

    const removeBase64Image = () => {
      const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio'];
      media.forEach((field) => {
        formData.value[field] = formData.value[field].map((img) => _.omit(img, ['base64', 'signedUrl']));
      });
    };

    const triggerSave = (res, type) => {
      if (res) {
        switch (type) {
          case 1:
            formData.value.currentPicture = res;
            break;
          case 2:
            formData.value.afterPicture = res;
            break;
          case 3:
            formData.value.refPicture.push(res);
            break;
          case 4:
            formData.value.audio = _.unionBy([...formData.value.audio, ...res], 'newNameWithPath');
            break;
        }
      }
      toggleSpinner(false);
    };

    const setSelProduData = (val) => {
      modelsList.value = val.modelsList;
      aggregateList.value = val.aggregateList;
      subAggregateList.value = val.subAggregateList;
    };

    const filterModelName = (val, update) => {
      update(() => {
        if (val === "") {
          modelsList.value = tempModelList.value;
        } else {
          const needle = val.toLowerCase();
          modelsList.value = tempModelList.value.filter((v) => v.name.toLowerCase().includes(needle));
        }
      });
    };

    const onRemoveFileFromChild = (type, index = null) => {
      $confirmBox(this, {
        message: "Would you like to remove.?",
      }).onOk(() => {
        if (type === 1) {
          if (formData.value.currentPicture && formData.value.currentPicture.length) {
            removeFileFromS3(formData.value.currentPicture.map(img => ({ ...img, path: img.newNameWithPath })));
            formData.value.currentPicture = [];
          }
        }
        if (type === 2) {
          removeFileFromS3(formData.value.afterPicture.map(img => ({ ...img, path: img.newNameWithPath })));
          formData.value.afterPicture = [];
        }
        if (type === 3) {
          removeFileFromS3(formData.value.refPicture.map(img => ({ ...img, path: img.newNameWithPath })));
          formData.value.refPicture = _.remove(formData.value.refPicture, (_ap, refIndex) => index !== refIndex);
        }
        if (type === 4) {
          removeFileFromS3(formData.value.audio.map(img => ({ ...img, path: img.newNameWithPath })));
          formData.value.audio = _.remove(formData.value.audio, (_ap, refIndex) => index !== refIndex);
        }
      });
    };

    const removeFileFromS3 = async (image) => {
      toggleSpinner(true);
      try {
        await fetch(`${process.env.API_BASE_URL}/remove-file-from-s3`, {
          method: "POST",
          mode: "cors",
          headers: {
            "content-type": "application/json",
            "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
            authorization: `Bearer ${localStorage.getItem("authorization")}`,
            "x-tenant": localStorage.getItem("tenant"),
          },
          body: JSON.stringify({ data: { image } }),
        });
        rerenderComponent.value = false;
        nextTick(() => {
          rerenderComponent.value = true;
        });
      } finally {
        toggleSpinner(false);
      }
    };

    const xssCheck = (val, type) => {
      if (type === 'text') {
        if (val.includes('>') || val.includes('<') || val.includes('=')) {
          return '">", "<" and "=" characters are not allowed';
        }
        return true;
      }
      return true;
    };
</script>
