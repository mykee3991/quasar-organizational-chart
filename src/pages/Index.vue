<template>
  <q-page>
    <q-drawer
      v-model="state.leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list
        v-mutation="methods.handler1"
        @dragenter="methods.onDragEnter"
        @dragleave="methods.onDragLeave"
        @dragover="methods.onDragOver"
        @drop="methods.onDrop"
        draggable="true"
        separator
        bordered
      >
        <q-item-label header> People </q-item-label>
        <q-separator />
        <q-item
          v-for="(person, index) in state.people"
          :key="`person-${index}`"
          draggable="true"
          @dragstart="methods.onDragStart"
          :id="person.id"
          class="cursor-pointer"
        >
          <q-item-section>
            <q-item-label>
              {{ person.name }}
            </q-item-label>
            <q-item-label caption>
              {{ person.email }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <div class="row">
      <div class="col-12">
        <div
          v-mutation="methods.handler2"
          @dragenter="methods.onDragEnter"
          @dragleave="methods.onDragLeave"
          @dragover="methods.onDragOver"
          @drop="methods.onDrop"
          style="overflow: hidden"
        >
          <panZoom
            selector=".orgchart-container"
            ref="panzoom"
            :options="{ minZoom: 0.3, maxZoom: 2 }"
          >
            <div class="panzoomable">
              <organization-chart
                @node-click="methods.nodeClick"
                :datasource="state.ds"
              >
                <template slot-scope="{ nodeData }">
                  <q-card
                    class="drop-area"
                    flat
                    v-if="
                      Object.keys(nodeData).length === 0 &&
                      nodeData.constructor === Object
                    "
                  >
                    <q-card-section>
                      <div class="text-h6">Drag and drop items here from the left pane</div>
                    </q-card-section>
                  </q-card>
                  <q-card
                    v-else
                    style="min-width: 300px"
                    class="drop-area cursor-pointer"
                    :class="{
                      'bg-white': !$q.dark.isActive,
                      'bg-black': $q.dark.isActive,
                    }"
                    flat
                    bordered
                  >
                    <q-card-section horizontal>
                      <q-item>
                        <q-item-section class="text-left">
                          <q-item-label>{{ nodeData.name }}</q-item-label>
                          <q-item-label caption>{{ nodeData.email }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-card-section>
                    <q-tooltip >
                      Click to Remove
                    </q-tooltip>
                  </q-card>
                </template>
              </organization-chart>
            </div>
          </panZoom>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "@vue/composition-api";
import { State, Method } from "components/models";
import OrganizationChart from "vue-organization-chart";
import "vue-organization-chart/dist/orgchart.css";

export default defineComponent({
  name: "PageIndex",
  components: { OrganizationChart },
  setup(_, context: any) {
    const root: any = context.root;
    const refs: any = context.refs;

    const methods: Method = {};
    const data: State = {
      status1: [],
      status2: [],
      leftDrawerOpen: true,
      dragging: false,
      people: [],
      ds: {},
      selectedNode: null,
      newNode: {
        id: "",
        name: "",
        username: "",
        email: "",
        address: "",
        phone: "",
        website: "",
        company: {},
      }
    };

    methods.handler1 = (mutationRecords: any) => {
      data.status1 = [];
      for (const index in mutationRecords) {
        const record = mutationRecords[index];
        const info = `type: ${record.type}, nodes added: ${
          record.addedNodes.length > 0 ? "true" : "false"
        }, nodes removed: ${
          record.removedNodes.length > 0 ? "true" : "false"
        }, oldValue: ${record.oldValue}`;
        data.status1.push(info);
      }
    };

    methods.handler2 = (mutationRecords: any) => {
      data.status2 = [];
      for (const index in mutationRecords) {
        const record = mutationRecords[index];
        const info = `type: ${record.type}, nodes added: ${
          record.addedNodes.length > 0 ? "true" : "false"
        }, nodes removed: ${
          record.removedNodes.length > 0 ? "true" : "false"
        }, oldValue: ${record.oldValue}`;
        data.status2.push(info);
      }
    };

    methods.onDragStart = (e: any) => {
      data.dragging = true;
      let p = data.people.filter((row: any) => row.id == e.target.id)[0];
      data.newNode.id = p.id;
      data.newNode.name = p.name;
      data.newNode.username = p.username;
      data.newNode.email = p.email;

      data.newNode.address = p.address;
      data.newNode.phone = p.phone;
      data.newNode.website = p.website;
      data.newNode.company = p.company;

      e.dataTransfer.setData("text", e.target.id);
      e.dataTransfer.dropEffect = "move";
    };

    methods.onDragEnter = (e: any) => {
      // don't drop on other draggables
      var arr = Array.from(e.target.classList);
      if (e.target.draggable !== true && arr.includes("drop-area")) {
        e.target.classList.add("drag-enter");
      }
    };

    methods.onDragLeave = (e: any) => {
      e.target.classList.remove("drag-enter");
    };

    methods.onDragOver = (e: any) => {
      e.preventDefault();
    };

    methods.onDrop = (e: any) => {
      e.preventDefault();

      // don't drop on other draggables
      if (e.target.draggable === true) {
        return;
      }

      var arr = Array.from(e.target.classList);

      const draggedId: string = e.dataTransfer.getData("text");
      const draggedEl: any = document.getElementById(draggedId);

      // // check if original parent node
      if (draggedEl.parentNode === e.target) {
        e.target.classList.remove("drag-enter");
        return;
      }

      // // make the exchange
      // draggedEl.parentNode.removeChild(draggedEl);
      e.target.click(); // e.target.appendChild(draggedEl);
      e.target.classList.remove("drag-enter");
      data.dragging = false;
    };

    methods.addNode = () => {
      var nNode: object = {
        id: data.newNode.id,
        name: data.newNode.name,
        username: data.newNode.username,
        email: data.newNode.email,
        address: data.newNode.address,
        phone: data.newNode.phone,
        website: data.newNode.website,
        company: data.newNode.company,
        children: [],
      };

      if (Object.keys(data.ds).length === 0 && data.ds.constructor === Object) {
        data.ds = nNode;
      } else {
        var newDS = methods.visit(data.ds, nNode, "add");
        data.ds = newDS;
      }

      data.selectedNode = null;
      data.actionsDialog = false;
      data.actionPanel = "";
      data.newNode = {
        id: "",
        name: "",
        username: "",
        email: "",
        address: "",
        phone: "",
        website: "",
        company: {},
      };
    };
    methods.removeFromTree = (parent: any, id: any) => {
      parent.children = parent.children
        .filter(function (child: any) {
          return child.id !== id;
        })
        .map(function (child: any) {
          return methods.removeFromTree(child, id);
        });
      return parent;
    };
    methods.deleteNode = () => {
      // Object.keys(this.ds).length === 1 && this.ds.constructor === Object
      if (data.ds.children.length === 0) {
        data.ds = {};
      } else {
        const removeFromTree = (parent: any, id: string | number) => {
          parent.children = parent.children
            .filter(function (child: any) {
              return child.id !== id;
            })
            .map(function (child: any) {
              return removeFromTree(child, id);
            });
          return parent;
        };

        var tree = removeFromTree(data.ds, data.selectedNode.id);
        data.ds = tree;
      }
      data.changes = true;
    };
    methods.visit = (obj: any, newNode: any, action: any) => {
      const recursion = (obj: any, index = null) => {
        var o = obj;

        if (o.id == newNode.id) {
          return obj;
        }

        if (o.id == data.selectedNode.id) {
          let isExist = o.children.filter((row: any) => row.id == newNode.id);
          if (isExist.length > 0) {
            return obj;
          }

          if (action == "add") {
            o.children.push(newNode);
          }
        }

        if (o.children.length > 0) {
          // check if has children
          o.children.forEach((v: any, i: string | number) => {
            // if has children do the same recursion for every children

            recursion(v);
          });
        }
        return o; // return final new object
      };

      return recursion(obj);
    };

    methods.fetchPeople = () => {
      root.$axios.get("users").then((r: any) => {
        data.people = r.data;
      });
    };
    methods.fetchPeople();

    methods.nodeClick = (node: any) => {
      data.selectedNode = node;
      if (data.dragging === true) {
        methods.addNode();
      } else {
        methods.deleteNode();
      }
      data.changes = true;
    };
    

    const state: State = reactive(data);
    return { state, methods };
  },
});
</script>
<style lang="css">
.orgchart-container {
  border: none;
  height: auto;
}
.orgchart {
  background: none;
}

.orgchart .node {
  width: auto;
}
.croppa-container canvas {
  background-color: lightblue;
}

.croppa-container {
  /*border: 2px solid grey;*/
  cursor: pointer;
}

.croppa-container:hover {
  opacity: 1;
  /*background-color: #8ac9ef;*/
}

.panzoomable {
  min-height: calc(100vh - 100px);
}

.orgchart-container {
  overflow: visible;
}
</style>
