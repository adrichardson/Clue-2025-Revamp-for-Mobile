import UIManager from "./UIManager.js";

class MessageManager {
    constructor() {
        this.feeds = new Map();
        this.unreadCounts = {};
        this.activeType = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        document.addEventListener("click", e => {
            const button = e.target.closest("[data-feed]");
            if (!button) return;

            e.preventDefault();
            this.show(button.dataset.feed);
        });
    }

    register({ type, feed, notification = null }) {
        this.feeds.set(type, { feed, notification });
        this.unreadCounts[type] ??= 0;
        if (!this.activeType) {
            this.activeType = type;
        }        
    }

    unregister(type) {
        this.feeds.delete(type);
        delete this.unreadCounts[type];
    }

    getFeed(type) {
        const config = this.feeds.get(type);
        if (!config) return null;

        return document.getElementById(config.feed);
    }

    add({ type, message, username = "", color = "#333333", classes = [], styles = {} }) {
        const feed = this.getFeed(type);
        if (!feed) return;

        const chatMessage = document.createElement("div");
        chatMessage.className = "chat-message";

        classes.forEach(cls => chatMessage.classList.add(cls));

        if (username) {
            const user = document.createElement("span");
            user.className = "chat-username";
            user.textContent = username;
            user.style.color = color;
            chatMessage.appendChild(user);
        }

        const text = document.createElement("span");
        text.className = "chat-messagetext";
        text.textContent = message;

        Object.assign(text.style, styles);

        chatMessage.appendChild(text);

        const container = feed.querySelector(".messages");

        container.appendChild(chatMessage);
        container.scrollTop = container.scrollHeight;

        this.updateNotification(type);
    } 

    load(type, entries) {
        entries.forEach(entry => {
            this.add({
                type,
                ...entry
            });
        });
    }

    clear(type) {
        const feed = this.getFeed(type);
        if (!feed) return;

        feed.querySelector(".messages").replaceChildren();
    }

    updateNotification(type) {
        const config = this.feeds.get(type);
        if (!config?.notification) return;

        if (UIManager.modalOpen()) {
            this.resetUnread(type);
            return;
        }

        this.unreadCounts[type]++;

        const bubble = document.getElementById(config.notification);
        if (!bubble) return;

        bubble.textContent = this.unreadCounts[type];
        bubble.classList.remove("hidden");
        bubble.style.animation = "none";
        void bubble.offsetWidth;
        bubble.style.animation = "pop .3s ease-out";      
    }

    resetUnread(type) {
        this.unreadCounts[type] = 0;

        const config = this.feeds.get(type);
        if (!config?.notification) return;

        const bubble = document.getElementById(config.notification);
        if (!bubble) return;

        bubble.classList.add("hidden");
    }
    
    scrollToBottom(type = this.activeType) {
        const feed = this.getFeed(type);
        if (!feed) return;

        const messages = feed.querySelector(".messages");
        if (!messages) return;

        messages.scrollTop = messages.scrollHeight;
    }

    markAllRead() {
        this.feeds.forEach((_, type) => this.resetUnread(type));
    }    

    show(type) {
        this.activeType = type;

        // Toggle feeds
        this.feeds.forEach((config, feedType) => {
            const feed = this.getFeed(feedType);
            if (!feed) return;

            feed.classList.toggle("hidden", feedType !== type);
        });

        // Toggle selected button
        document.querySelectorAll("[data-feed]").forEach(button => {
            button.classList.toggle("selected", button.dataset.feed === type);
        });

        // Scroll active feed
        this.scrollToBottom(type);
        this.resetUnread(type);
    }
}

export default new MessageManager();