<template>
  <div style="overflow:auto;">
    <q-form ref="formICF">
      <div class="col-md-6 col-xl-6 col-sm-6 col-xs-12 q-pa-xs text-subtitle1">
        <q-card flat bordered class>
          <q-card-section>
            <div class="col-md-6 col-xs-12">
              <div
                class="text-subtitle1 text-bold q-py-xs"
              >
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
              <div
                v-for="(file, index) in getCurrentPicture"
                :key="`${file.orignalName}_${index}`"
              >
                <img-preview
                  v-if="file && getCurrentPicture.length"
                  class="example"
                  :value="file"
                  :remove="false"
                  :show-name="false"
                  @removeImage="onRemoveFileFromChild(1)"
                />
              </div>

              <div
                v-for="(file, index) in getAfterPicture"
                :key="`${file.orignalName}_${index}`"
              >
                <img-preview
                  v-if="file && getAfterPicture.length"
                  class="example"
                  :value="file"
                  :remove="false"
                  :show-name="false"
                  @removeImage="onRemoveFileFromChild(2)"
                />
              </div>

              <!-- Image uploader 2 tui -->
              <div
                v-for="(file, index) in getRefPicture"
                :key="`${file.orignalName}_${index}`"
              >
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
                <template v-slot:header="scope">
                  <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                    <q-btn
                      v-if="getAudio.length"
                      icon="clear_all"
                      round
                      dense
                      flat
                      @click="scope.removeQueuedFiles"
                    >
                      <q-tooltip>
                        {{
                        $t("common.clearAll")
                        }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="scope.uploadedFiles.length > 0"
                      icon="done_all"
                      round
                      dense
                      flat
                      @click="scope.removeUploadedFiles"
                    >
                      <q-tooltip>
                        {{'Upload mockups'}}
                      </q-tooltip>
                    </q-btn>
                    <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                    <div class="col">
                      <div
                        class="q-uploader__title"
                      >
                        {{ 'Upload mockups' }}
                      </div>
                    </div>
                    <q-btn
                      round
                      type="a"
                      color="primary"
                      icon="burst_mode"
                    >
                      <q-uploader-add-trigger />
                      <q-tooltip>
                        {{
                        `${$t("common.pick")} ${$t("common.files")}`
                        }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      ref="uploader"
                      icon="cloud_upload"
                      style="display: none"
                      round
                      dense
                      flat
                      @click="scope.upload"
                    >
                      <q-tooltip>
                        {{
                        `${$t("common.upload")} ${$t("common.files")}`
                        }}
                      </q-tooltip>
                    </q-btn>

                    <q-btn
                      v-if="scope.isUploading"
                      icon="clear"
                      @click="scope.abort"
                      round
                      dense
                      flat
                    >
                      <q-tooltip>
                        {{
                        `${$t("common.abort")} ${$t("common.upload")}`
                        }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </template>

                <!-- Image uploader 2 tui -->
                <template v-slot:list>
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

            <!-- Marckup/Sketch -->
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
import Vue from "vue";
import fullscreen from "vue-fullscreen";
import { mapGetters, mapMutations } from "vuex";

import { getCompresedFile } from "@/utils/imageCompress";

Vue.use(fullscreen);

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
    "img-preview": () => import("components/Uploader/preview.vue"),
    imageUploader: () => import("components/Uploader/quasarUploader.vue"),
    productWsSelector: () => import("components/common/productWsSelector.vue")
  },
  data() {
    return {
      editor: {},
      canvasId: 'studio-space',
      fullscreen: false,
      headers: [
        {
          name: "x-tenant",
          value: localStorage.getItem("tenant"),
        },
        {
          name: "authorization",
          value: `Bearer ${localStorage.getItem("authorization")}`,
        },
        {
          name: "x-feathers-jwt",
          value: `Bearer ${localStorage.getItem("vtl2.0")}`,
        },
      ],
      url: `${process.env.API_BASE_URL}/uploads`,
      method: "POST",
      accept: "image/png,image/gif,image/jpeg,image/webp",
      fieldName: "files",
      triggerSaveFunctionCallCount: 0,
      fileCount: 0,
      lorem: "Lorem ipsum ",
      text: "",
      varApplicationId: "",
      varModelName: [],
      aggregates: [],
      subAggregates: [],
      parts: [],
      startDate: "",
      endDate: "",
      mobile: "",
      formData: {
        ideaNum: "",
        chargeCode: { _id: this.wk.chargCodeId },
        workshop: {
          _id: this.wk._id,
          workshopCode: this.wk.workshopCode,
          name: this.wk.workshopCode, //display name for wkcode
        },
        level: {
          _id: "",
          name: "",
        },
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
        // video: [],
        currentPicture: [],
        afterPicture: [],
        refPicture: [],
        pedningFunc: null,
      },
      rerenderComponent: true,
      ideaCount: 0,
      events: [],
    };
  },
  computed: {
    ...mapGetters("VTL", ["user", "getSelChargeCode"]),
    ...mapGetters("idea", ["ideaIcfCount"]),
    ...mapGetters("idea", { ideaCreated: 'created' }),
    ideaTotalCount() {
      return this.ideaCount;
    },
    getCurrentPicture() {
      return this.formData.currentPicture;
    },
    getAfterPicture() {
      return this.formData.afterPicture;
    },
    getRefPicture() {
      return this.formData.refPicture;
    },
    getAudio() {
      return this.formData.audio;
    },
    isMobile: {
      get() {
        return this.mobile;
      },
      set(val) {
        this.mobile = val;
      },
    },
    ideaCountQuery() {
      const query =  {
        $limit: 0,
        "chargeCode._id": this.getSelChargeCode,
        $or: [{ deletedAt: null }, { deletedAt: { $ne: null } }],
      }
      return query
    },
    findIdea() {
      const query =  this.ideaCountQuery
      return this.$api.Idea.findInStore({ query })
    }
  },
  watch: {
    ideaCreated(newValue) {
      if(newValue) {
        this.ideaCreatedEvent(this, newValue)
      }
    }
  },
  created() {
    const self = this;
    const wk = _.cloneDeep(this.wk)
    this.mobile = window.screen.width > 767 ? false : true;

    window.addEventListener("resize", function () {
      self.$nextTick(() => {
        self.isMobile = window.screen.width > 767 ? false : true;
      });
    });

    if (wk.icfConfig) {
      if (
        this.formData.primVariable.length !==
        wk.icfConfig.primVariable.length
      ) {

        for (let i = 0; i < wk.icfConfig.primVariable.length; i++) {
          this.formData.primVariable.push({
            _id: "",
            name: "",
            value: (wk.icfConfig.primVariable[i].dataType === "multiple")
              ? []
              : "",
            seq: wk.icfConfig.primVariable[i].seq,
            unit: wk.icfConfig.primVariable[i].unit,
          });
        }
      }

      if (
        this.formData.secVariable.length !==
        wk.icfConfig.secVariable.length
      ) {
        for (let i = 0; i < wk.icfConfig.secVariable.length; i++) {
          this.formData.secVariable.push({
            _id: "",
            name: "",
            value: (wk.icfConfig.secVariable[i].dataType === "multiple")
              ? []
              : "",
            seq: wk.icfConfig.secVariable[i].seq,
            unit: wk.icfConfig.secVariable[i].unit,
          });
        }
      }
    }
  },
  mounted() {
    // this.$refs.editor.set('arrow')
    // this.$refs.editor.set('selectMode')
    // this.$refs.editor.set(this.editor.mode, this.editor.options)
    // let textModeOptions = { id: 'title', fill: 'red', fontFamily: 'Verdana',fontSize: 16, placeholder: 'Type something'}
    // this.$refs.editor.set('text', textModeOptions)

    const wk = _.cloneDeep(this.wk)

    if (this.idea._id) {
      this.formData = this.idea
      const fields = ['aggregateId', 'subAggregateId', 'partName']

      _.forEach(fields, (field) => {
        if(!_.isEmpty(this.formData[field])) {
          if(this.formData[field] && !this.formData[field]._id) {
            this.formData[field] = null
          }
        }
      });

      this.removePlaceholderImage()

      this.formData.primVariable = _.map(
        _.merge(wk.icfConfig.primVariable, this.formData.primVariable),
        (primVar) => {
          if (primVar?.dataType === 'multiple') {
            primVar['value'] = _.isArray(primVar['value'])
              ? primVar['value']
              : [primVar?.value || '']
          }

          return primVar
        }
      )
      this.formData.secVariable = _.map(
        _.merge(wk.icfConfig.secVariable, this.formData.secVariable),
        (secVar) => {
          if (secVar?.dataType === 'multiple') {
            secVar['value'] = _.isArray(secVar['value'])
              ? secVar['value']
              : [secVar?.value || '']
          }

          return secVar
        }
      )
    }

    if (this.ideaIcfCount) {
      this.ideaCount = this.ideaIcfCount;
    } else {
      this.getIdeaCount();
    }
  },
  destroyed() {
    this.restFormData()
    this.$emit('icf-destroyed')
  },
  methods: {
    ...mapMutations("VTL", ["toggleSpinner"]),
    setProduct(val) {
      this.$set(this.formData, 'productId', val)
    },
    setAggregate(val) {
      this.$set(this.formData, 'aggregateId', val)
    },
    setSubAggregate(val) {
      this.$set(this.formData, 'subAggregateId', val)
    },
    setPart(val) {
      this.$set(this.formData, 'partName', val)
    },
    ideaCreatedEvent(self, idea) {
      if (idea) self.ideaCount = self.ideaCount + 1;
    },
    getIdeaCount() {
      const query =  this.ideaCountQuery
      query["x-tenant"] = localStorage.getItem("tenant"),
      this.$api.Idea.find({ query })
        .then((res) => {
          if (res) {
            this.ideaCount = res.total;
          }
        })
    },
    reRender() {
      this.rerenderComponent = false;
      this.$nextTick(() => {
        this.rerenderComponent = true;
      });
    },
    async uploadFile(file) {
      this.toggleSpinner(true)
      const form = await getCompresedFile(file);
      this.$axios.post("/uploads", form, {
        headers: {
          "x-tenant": localStorage.getItem("tenant"),
          "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
          authorization: `Bearer ${localStorage.getItem("authorization")}`,
        },
      }).then((res) => {
        this.uploaded({ xhr: res.request, files: res.data }, true);
      }).then(() => this.toggleSpinner(false))
      .catch(() => this.toggleSpinner(false));
    },
    async uploaded(info) {
      const { xhr } = info;
      const response =
        typeof xhr.response === "string"
          ? JSON.parse(xhr.response)
          : xhr.response;

      if (response.length) {
        response[0].newNameWithPath = response[0].newNameWithPath;
        await this.triggerSave(response[0], 3);
      }
    },
    async uploadedSketchImage(files) {
      console.log(files)
      // this.toggleSpinner(true)
      // const form = new FormData()
      // _.forEach(files, (file) => {
      //   form.append('files', file)
      // })

      // this.$axios.post('/uploads', form, {
      //   headers: {
      //     "x-tenant": localStorage.getItem("tenant"),
      //     "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
      //     authorization: `Bearer ${localStorage.getItem("authorization")}`
      //   }
      // }).then(({ data }) => {
      //   if (!_.isEmpty(data)) {
      //     this.triggerSave(data, 4);          
      //   } else {
      //     this.toggleSpinner(false)
      //   }
      // })
    },
    async uploadCurrentPicture(file) {
      this.toggleSpinner(true);
      const form = await getCompresedFile(file);
      this.$axios.post("/uploads", form, {
        headers: {
          "x-tenant": localStorage.getItem("tenant"),
          "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
          authorization: `Bearer ${localStorage.getItem("authorization")}`,
        },
      }).then((res) => {
        this.formData.currentPicture = res.data.map((img) => {
          img.newNameWithPath = img.newNameWithPath;
          return img;
        });
      }).then(() => this.toggleSpinner(false))
      .catch(() => this.toggleSpinner(false));
    },
    async uploadAfterPicture(file) {
      this.toggleSpinner(true);
      const form = await getCompresedFile(file);
      this.$axios.post("/uploads", form, {
        headers: {
          "x-tenant": localStorage.getItem("tenant"),
          "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
          authorization: `Bearer ${localStorage.getItem("authorization")}`,
        },
      }).then((res) => {
        this.formData.afterPicture = res.data.map((img) => {
          img.newNameWithPath = img.newNameWithPath;
          return img;
        });
      }).then(() => this.toggleSpinner(false))
      .catch(() => this.toggleSpinner(false));
    },
    padLeft(nr, n, str) {
      return Array(n - String(nr).length + 1).join(str || "0") + nr;
    },
    saveIdeasToiLake() {
      // let ideaLakeData = await this.pushGeneratedIdeasToILake();
      this.$refs.formICF.validate().then((status) => {
        if (!this.bulkAdd) {
          this.formData.secVariable.map((x, index) => {
            if (x && this.wk.icfConfig.secVariable[index]) {
              x._id = this.wk.icfConfig.secVariable[index]._id;
              x.name = this.wk.icfConfig.secVariable[index].name;
              x.unit =
                this.wk.icfConfig.secVariable[index] &&
                this.wk.icfConfig.secVariable[index].unit
                  ? this.wk.icfConfig.secVariable[index].unit.name
                  : null;
            }

            return x;
          });

          this.formData.primVariable.map((x, index) => {
            if (x && this.wk.icfConfig.primVariable[index]) {
              x._id = this.wk.icfConfig.primVariable[index]._id;
              x.name = this.wk.icfConfig.primVariable[index].name;
             x.unit =
                this.wk.icfConfig.primVariable[index] &&
                this.wk.icfConfig.primVariable[index].unit
                  ? this.wk.icfConfig.primVariable[index].unit.name
                  : null;
            }

            return x;
          });
        }
        if (
          this.formData.partName &&
          this.formData.partName.hasOwnProperty("name")
        ) {
          this.formData.level._id = "4";
          this.formData.level.name = "Part";
        } else if (
          this.formData.subAggregateId &&
          this.formData.subAggregateId.hasOwnProperty("name")
        ) {
          this.formData.level._id = "3";
          this.formData.level.name = "Sub-Aggregate";
        } else if (
          this.formData.aggregateId &&
          this.formData.aggregateId.hasOwnProperty("name")
        ) {
          this.formData.level._id = "2";
          this.formData.level.name = "Aggregate";
        } else {
          this.formData.level._id = "1";
          this.formData.level.name = "Model";
        }
        if (this.formData && status) {
          const query = {
            $limit: 0,
            "chargeCode._id": this.getSelChargeCode,
            $or: [{ deletedAt: null }, { deletedAt: { $ne: null } }],
            'x-tenant': localStorage.getItem("tenant")
          }
          
          const ideaCountCallback = () => {
            let cloneData = _.cloneDeep(this.formData.secVariable);

            this.formData["saving"] = cloneData
              .filter((x) => x.name === "Saving")
              .map((v) => _.toNumber(v.value))[0];

            const msg = this.formData._id
              ? this.$t("itrack.ideaUpdateSuccess")
              : this.$t("itrack.ideaAddedSuccess");

            this.toggleSpinner(true);
            this.removePlaceholderImage()
            var tempIdea = _.cloneDeep(this.formData)

            const callback = (res) => {
              this.toggleSpinner(false);
              const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio']
              _.forEach(media, (field) => {
                res[field] = _.merge(tempIdea[field], res[field])
              })

              this.$nextTick(() => {
                this.$emit('idea-saved', res)
  
                if (res) {
                  this.$q.notify(msg);
                  this.$store.commit('idea/updateItem', _.merge(tempIdea, res))
                  this.restFormData();
                  const event = (this.formData._id) ? 'ideaPatchedEvent' : 'ideaCreatedEvent'
                  console.log({ res, merged: _.merge(tempIdea, res) })
                  this.$emit(event, _.merge(tempIdea, res))
                } else {
                  this.$q.notify(error.message);
                }
              })
            };

            if (
              this.user.role === "Super Admin" &&
              localStorage.getItem("tenant") === process.env.DEFAULT_TENANT
            ) {
              this.$q.notify({
                type: "warning",
                message: "Super admin don't have permission to do this operation!",
              });
              return;
            }
            this.removeBase64Image()

            new this.$api.Idea(this.formData)
              .save({ query: { isExcelUI: false }})
              .then(callback)
          }

          if (!this.formData._id) {
            let ideaNumber = this.padLeft(1, 5);
            this.formData.ideaNum = `IWksp_${ideaNumber}`;
            // this.ideaCount = res.total;
            ideaCountCallback()
            // this.$api.Idea.find({ query })
            //   .then((res) => {
            //     if (res) {
            //       let idaCount = Number(res.total) + 1;
            //       let ideaNumber = this.padLeft(idaCount, 5);
            //       this.formData.ideaNum = `IWksp_${ideaCount}`;
            //       this.ideaCount = res.total;
            //     }
            //   }).then(ideaCountCallback)
          } else {
            ideaCountCallback()
          }
        } else {
          this.$q.notify(this.$t("common.recordNotSaved"));
        }
      });
    },
    removePlaceholderImage() {
      const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio']
      _.forEach(media, (field) => {
        this.formData[field] = _.reject(this.formData[field], { orignalName: "placeholder.jpg" })
      })
    },
    removeBase64Image() {
      const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio']
      _.forEach(media, (field) => {
        this.formData[field] = _.map(
          this.formData[field],
          (img) => _.omit(img, ['base64', 'signedUrl'])
        );
      })
    },
    triggerSave(res, type) {
      if (res) {
        switch (type) {
          case 1:
            this.formData.currentPicture = res;
            break;
          case 2:
            this.formData.afterPicture = res;
            break;
          case 3:
            this.formData.refPicture.push(res);
            break;
          case 4:
            this.formData.audio = _.unionBy(
              [...this.formData.audio, ...res],
              'newNameWithPath'
            )
            break;
        }
      }
      this.toggleSpinner(false)
    },
    setSelProduData(val) {
      this.modelsList = val.modelsList;
      this.aggregateList = val.aggregateList;
      this.subAggregateList = val.subAggregateList;
    },
    filterModelName(val, update) {
      update(() => {
        if (val === "") {
          this.modelsList = this.tempModelList;
        } else {
          const needle = val.toLowerCase();
          this.modelsList = this.tempModelList.filter(
            (v) => v.name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    },
    restFormData() {
      this.$nextTick(() => {
        if (this.formData._id) delete this.formData._id;
        this.formData.title = "";
        this.formData.description = "";
        this.formData.audio = [];
        this.formData.currentPicture = [];
        this.formData.refPicture = [];
        this.formData.afterPicture = [];
        this.formData.productId = null;
        this.formData.aggregateId = null;
        this.formData.subAggregateId = null;
        this.formData.partName = null;
        _.forEach(this.formData.secVariable, (x) => {
          x.value = null;
        });
        _.forEach(this.formData.primVariable, (x) => {
          x.value = null;
        });
        this.$nextTick(() => {
          if (this.$refs.formICF) {
            this.$refs.formICF.resetValidation();
          }
          this.reRender();
        });
        this.$emit('switch-previous-tab', true)
      });
    },
    onRemoveFileFromChild(type, index = null) {
      this.$confirmBox(this, {
        message: "Would you like to remove.?",
      }).onOk(() => {
        if (type === 1) {
          if (
            this.formData.currentPicture &&
            this.formData.currentPicture.length
          ) {
            this.removeFileFromS3(
              _.map(this.formData.currentPicture, (img) => {
                img["path"] = img.newNameWithPath;
                return img;
              })
            );
            this.formData.currentPicture = [];
          }
        }
        if (type === 2) {
          this.removeFileFromS3(
            _.map(this.formData.afterPicture, (img) => {
              img["path"] = img.newNameWithPath;
              return img;
            })
          );
          this.formData.afterPicture = [];
        }
        if (type === 3) {
          this.removeFileFromS3(
            _.map(this.formData.refPicture, (img) => {
              img["path"] = img.newNameWithPath;
              return img;
            })
          );
          this.formData.refPicture = _.remove(
            this.formData.refPicture,
            function (_ap, refIndex) {
              return index !== refIndex;
            }
          );
        }
        if (type === 4) {
          this.removeFileFromS3(
            _.map(this.formData.audio, (img) => {
              img["path"] = img.newNameWithPath;
              return img;
            })
          );
          this.formData.audio = _.remove(
            this.formData.audio,
            (_ap, refIndex) => {
              return index !== refIndex;
            }
          );
        }
      });
    },
    removeFileFromS3(image) {
      this.toggleSpinner(true)
      fetch(`${process.env.API_BASE_URL}/remove-file-from-s3`, {
        method: "POST",
        mode: "cors",
        headers: {
          "content-type": "application/json",
          "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
          authorization: `Bearer ${localStorage.getItem("authorization")}`,
          "x-tenant": localStorage.getItem("tenant")
        },
        body: JSON.stringify({ data: { image } }),
      }).then((r) => r.json())
        .then(() => {
          this.rerenderComponent = false

          this.$nextTick(() => {
            this.rerenderComponent = true
          })
        })
      .then(() => this.toggleSpinner(false))
      .catch(() => this.toggleSpinner(false));
    },
    xssCheck(val, type) {
      if (type === 'text') {
        if (
          _.includes(val, '>') ||
          _.includes(val, '<') ||
          _.includes(val, '=')
        ) {
          return '">", "<" and "=" characters are not allowed'
        } else {
          return true
        }
      }

      return true
    }
  },
};
</script>

<style scoped>
.q-uploader__file--img {
  color: #fff;
  min-height: 200px !important;
  min-width: 200px !important;
  height: 600px !important;
}
</style>
