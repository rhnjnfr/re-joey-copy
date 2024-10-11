<template>
    <div class="flex h-screen overflow-y-hidden">
        <div class="w-[30%] border-r-2 text-gray-600 pr-6">
            <div class="py-4">
                <span class="text-xl font-bold">Chats</span>
            </div>
            <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input id="search" name="search"
                    class="block w-full rounded-lg bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                    placeholder="Search Location" type="search" />
            </div>
            <div class="py-4">
                <div class="mb-2">
                    <span class="text-md font-semibold">Inbox</span>
                </div>
                <div class="overflow-y-auto h-screen">
                    <div v-for="(conversation, index) in conversations" :key="index"
                        @click="selectConversation(conversation)">
                        <div class="border-t p-2 px-4 cursor-pointer hover:bg-gray-50"
                            :class="{ 'bg-gray-100': JSON.stringify(conversation) === JSON.stringify(selectedConversation.messages) }">
                            <div class="flex justify-between">
                                <span class="font-medium truncate">{{ conversation[0].to === 'me' ? conversation[0].from
                                    :
                                    conversation[0].to }}</span>
                                <span class="text-[12px] sm:hidden xl:flex">{{ getLastMessage(conversation).timestamp
                                    }}</span>
                            </div>
                            <p class="text-sm truncate">{{ getLastMessage(conversation).message }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-[70%] flex flex-col border-r-2">
            <div class="text-gray-600 bg-white p-4 flex gap-x-2 items-center">
                <span class="text-md font-semibold">{{ selectedConversation.from }}</span>
                <span class="text-sm font-medium border rounded-xl px-2">badge</span>
            </div>
            <div class="flex-1 overflow-y-auto px-4 bg-gray-50">
                <div v-for="(message, messageIndex) in sortedMessages" :key="messageIndex">
                    <div v-if="message.from !== 'me'" class="flex text-sm text-gray-600 p-3 justify-start">
                        <span>{{ message.timestamp }}</span>
                        <div>
                            <span v-if="messageIndex === 0 || message.from !== sortedMessages[messageIndex - 1].from"
                                class="font-medium">{{ message.from }}</span>
                            <div
                                class="mt-2 border w-fit py-3 sm:mr-12 md:mr-40 lg:mr-60 xl:mr-96 text-gray-600 px-6 rounded-t-lg rounded-r-lg bg-amber-200">
                                <p>{{ message.message }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-else class="flex text-sm text-gray-600 p-3 justify-end">
                        <div>
                            <!-- <span v-if="messageIndex === 0 || message.from !== sortedMessages[messageIndex - 1].from"
                                class="font-medium">me</span> -->
                            <div
                                class="mt-2 border w-fit sm:ml-12 md:ml-40 lg:ml-60 xl:ml-96 text-gray-600 py-3 px-6 rounded-t-lg rounded-l-lg bg-teal-200">
                                <p>{{ message.message }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <form>
                <div class="mt-auto flex border items-center">
                    <div class="flex justify-start w-full">
                        <textarea name="message" id="" placeholder="Write a message..."
                            class="w-full px-6 py-6 outline-none" />
                    </div>
                    <div class="flex px-6 gap-x-3 justify-end">
                        <PaperClipIcon class="h-7 w-7 text-gray-400" aria-hidden="true" />
                        <PaperAirplaneIcon class="h-7 w-7 text-gray-400" aria-hidden="true" />
                    </div>
                    <!-- <div>
                        <button type="submit"
                            class="bgteal hover:bg-teal-700 h-fit grid content-end text-white font-bold py-2 px-4 rounded">
                            Send</button>
                    </div> -->
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { MagnifyingGlassIcon, PaperAirplaneIcon, PaperClipIcon } from "@heroicons/vue/20/solid";

export default {
    components: {
        MagnifyingGlassIcon, PaperAirplaneIcon, PaperClipIcon
    },
    data() {
        return {
            inboxs: [
                { id: 1, from: 'User  1', to: 'me', message: 'Hi..', timestamp: '2022-01-01 10:00:00' },
                { id: 1, from: 'User  1', to: 'me', message: 'How are you?', timestamp: '2022-01-01 10:01:00' },
                { id: 1, from: 'User  1', to: 'me', message: 'hello?', timestamp: '2022-01-01 10:04:05' },
                { id: 2, from: 'User  2', to: 'me', message: 'im 2', timestamp: '2022-01-01 10:04:06' },
                { id: 3, from: 'User  3', to: 'me', message: 'im 3', timestamp: '2022-01-01 10:04:10' },
                { id: 4, from: 'User  4', to: 'me', message: 'im 4', timestamp: '2022-01-01 10:04:11' },
                { id: 4, from: 'User  4', to: 'me', message: 'your', timestamp: '2022-01-01 10:04:11' },
                { id: 4, from: 'User  4', to: 'me', message: 'yeh? why you have a problem? dfdf dsad dsadsdas ds ds dasdsadas dsdsa dsdsdsa gdsagk gdsiaugd shdsah ku dsahdgu gdusagug g dusadgu dsadsad sa', timestamp: '2022-01-01 10:05:14' },
                { id: 5, from: 'me', to: 'User  1', message: 'Hi..', timestamp: '2022-01-01 10:00:00' },
                { id: 5, from: 'me', to: 'User  2', message: 'How are you?', timestamp: '2022-01-01 10:01:00' },
                { id: 5, from: 'me', to: 'User  1', message: 'hello...', timestamp: '2022-01-01 10:04:07' },
                { id: 5, from: 'me', to: 'User  3', message: 'im 2', timestamp: '2022-01-01 10:04:06' },
                { id: 5, from: 'me', to: 'User  4', message: 'im 3 fsd fddsfd fdfds fd fsdf dsfdfs dfd f d fd fd fd fd fd fd fdfdsf dfdsf df d fsdf sf', timestamp: '2022-01-01 10:04:10' },
                { id: 5, from: 'me', to: 'User  4', message: 'your 4?', timestamp: '2022-01-01 10:04:13' },
            ],
            conversations: {},
            selectedConversation: {}
        }
    },
    mounted() {
        this.conversations = this.groupMessagesByConversation(this.inboxs);
        this.conversations = Object.values(this.conversations).sort((a, b) => {
            const lastMessageA = this.getLastMessage(a);
            const lastMessageB = this.getLastMessage(b);
            return new Date(lastMessageB.timestamp) - new Date(lastMessageA.timestamp);
        });
        this.selectConversation(this.conversations[0]);
    },
    methods: {
        groupMessagesByConversation(inboxs) {
            const conversations = {};
            inboxs.forEach((message) => {
                const key = message.from === 'me' ? message.to : message.from;
                if (!conversations[key]) {
                    conversations[key] = [];
                }
                conversations[key].push(message);
            });
            return conversations;
        },
        selectConversation(conversation = this.conversations[0]) {
            this.selectedConversation = {
                from: conversation[0].to === 'me' ? conversation[0].from : conversation[0].to,
                messages: conversation
            }
        },
        getLastMessage(conversation) {
            return conversation.reduce((last, current) => {
                return current.timestamp > last.timestamp ? current : last;
            }, conversation[0]);
        }
    },
    computed: {
        sortedMessages() {
            if (!this.selectedConversation.messages) {
                return [];
            }
            return this.selectedConversation.messages.sort((a, b) => {
                return new Date(a.timestamp) - new Date(b.timestamp);
            });
        }
    }
};
</script>
