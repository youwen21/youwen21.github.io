function supportsHLS() {
    var video = document.createElement("video");
    return Boolean(
        video.canPlayType("application/vnd.apple.mpegURL") ||
        video.canPlayType("audio/mpegurl")
    );
}

// isMp4: function (playUrl) {
//   if (playUrl.indexOf(".mp4") != -1) {
//     return true;
//   }

//   return false;
// },

function isMp4(playUrl) {
    if (playUrl.endsWith(".mp4")) {
        return true;
    } else {
        return false;
    }
}

function filterByGroupName(itemArr, groupName) {
    return itemArr.filter((item) => item["group-title"] === groupName);
}

function extractGroupTitles(m3uData) {
    const groupTitlePattern = new RegExp('group-title="([^"]+)"', "gm");
    const matches = [...m3uData.matchAll(groupTitlePattern)];

    const groupTitles = new Set();
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const groupTitle = match[1];
        groupTitles.add(groupTitle);
    }

    return Array.from(groupTitles);
}

function parseToMap(m3uData) {
    const urlPattern = new RegExp("^http[s]?://.+", "gm");
    const urlMatches = m3uData.match(urlPattern);

    const channelPattern = new RegExp("#EXTINF:-1 ([^,]+),(.+)", "gm");
    const matches = [...m3uData.matchAll(channelPattern)];

    if (urlMatches.length !== matches.length) {
        throw new Error("数据格式有问题");
    }

    const kvRegex = new RegExp('([\\w-]+)="([^"]+)"', "gm");

    const result = [];
    for (let idx = 0; idx < matches.length; idx++) {
        const match = matches[idx];
        const attributes = match[1];
        const channelName = match[2];

        const kvMatches = [...attributes.matchAll(kvRegex)];
        const itemMap = {};

        for (let j = 0; j < kvMatches.length; j++) {
            const kvMatch = kvMatches[j];
            const key = kvMatch[1];
            const value = kvMatch[2];
            itemMap[key] = value;
        }

        itemMap["channel-name"] = channelName;
        itemMap["channel-url"] = urlMatches[idx];

        result.push(itemMap);
    }

    return result;
}

function getTvName(tvItem) {
    return tvItem["channel-name"] ?? tvItem["tvg-name"];
}