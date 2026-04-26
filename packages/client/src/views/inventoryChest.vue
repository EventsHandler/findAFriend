
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const items = ref([
  { id: 1, name: 'Wooden Chest',  icon: '#',type: "Common", quantity: 2 },
  { id: 2, name: 'Iron Chest', icon: '/icons/potion.png', type: "Rare", quantity: 4 },
  { id: 3, name: 'Golden Chest', icon: '/icons/shield.png',type: "Legendary", quantity: 1 },
])

function rarityColor(type: string) {
  switch (type) {
    case 'Common':    return 'text-gray-400'
    case 'Rare':      return 'text-blue-400'
    case 'Legendary': return 'text-yellow-400'
    default:          return 'text-white'
  }
}

function handleItemClick(item: any) {
  console.log('Clicked item:', item.name)
}
</script>

<template>
    <div class="chooseSection flex items-center bg-[#101712]" >
            <button @click="router.push('/inventoryChest')" class="chestsBtn border bg-lime-500 border-lime-400/30 hover:bg-lime-400" > Chests </button>
            <button @click="router.push('/inventoryBadge')" class="badgesBtn border border-lime-400/30 hover:bg-lime-400"> Badges </button>
    </div>
    <div class="inventory flex items-center flex-wrap border border-lime-500/30 bg-[#101712] p-8 shadow-[0_0_30px_rgba(132,255,122,0.05)]">
        <div class="item border border-lime-500/30 flex flex-col" 
            v-for="item in items" 
            :key="item.id" 
            role="button"
            tabindex="0"
            @click="handleItemClick(item)"
            @keydown.enter="handleItemClick(item)">
                <img :src="item.icon" :alt="item.name" />
                <span class="item-name flex items-center " :class="rarityColor(item.type)">{{ item.name }}</span>
                <div class="item-info flex items-center">
                    <span class="item-type flex items-center " :class="rarityColor(item.type)">{{ item.type }}</span>
                    <span class="item-qty flex items-center" :class="rarityColor(item.type)">x{{ item.quantity }}</span>
                </div>
        </div>
    </div>
</template>


<style scoped>
.chooseSection,
.inventory,
.item  {
    color: white;
    margin: 0;
}
.chestsBtn, .badgesBtn{
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 1em;
}
.chestsBtn {
    border-radius: 5px 0 0 0;
    color: black;
}
.badgesBtn {
    border-radius: 0 5px 0 0;
    border-left: none;
}
.badgesBtn:hover {
    color:black;
}
.chooseSection {
    margin: 2em 3em 0 3em;
}
.inventory {
    padding: 1em;
    border-top: none;
    border-radius: 0 0 5px 5px;
    margin: 0 3em;
}
.item {
    margin: 1em;
    width: 8em;
    height: 8em;
    overflow: hidden;
    word-break: break-word;
    display: flex;
    flex-direction: column;
    align-items: center;  /* centers image and name horizontally */
    padding: 0.3em;
    cursor: pointer;
}
.item-name {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
}
.item-info {
    display: flex;
    justify-content: space-between;  /* rarity left, quantity right */
    width: 100%;
    margin-top: auto;                /* pushes it to the bottom */
}

</style>