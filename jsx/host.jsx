var AdobeCreativeMCP = AdobeCreativeMCP || {};

(function () {
    var PRODUCT = "Adobe Creative MCP";
    var VERSION = "2.0.0";
    var PROTOCOL = "2.0";

    function hostRole() {
        var name = "";
        try { name = String(app.name || "").toLowerCase(); } catch (e) {}
        if (name.indexOf("photoshop") >= 0) return "photoshop";
        return "after-effects";
    }

    function esc(value) {
        if (value === null || value === undefined) value = "";
        value = String(value).replace(/\\/g, "\\\\");
        value = value.replace(/"/g, "\\\"").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
        return value;
    }

    function jsonValue(value) {
        if (value === null || value === undefined) return "null";
        if (typeof value === "number") return isFinite(value) ? String(value) : "null";
        if (typeof value === "boolean") return value ? "true" : "false";
        if (typeof value === "string") return "\"" + esc(value) + "\"";
        if (value instanceof Array) {
            var a = [];
            for (var i = 0; i < value.length; i++) a.push(jsonValue(value[i]));
            return "[" + a.join(",") + "]";
        }
        if (typeof value === "object") {
            var o = [];
            for (var k in value) if (value.hasOwnProperty(k)) o.push("\"" + esc(k) + "\":" + jsonValue(value[k]));
            return "{" + o.join(",") + "}";
        }
        return "\"" + esc(value) + "\"";
    }

    function ok(message, data) { return jsonValue({ ok: true, message: message || "ok", data: data || {} }); }
    function fail(error, code) { return jsonValue({ ok: false, error: String(error || "unknown error"), code: code || "ADOBE_CREATIVE_MCP_ERROR" }); }
    function parseJson(value) { if (typeof value === "object") return value; if (typeof JSON !== "undefined" && JSON.parse) return JSON.parse(value); return eval("(" + value + ")"); }
    function safeString(value) { return value === null || value === undefined ? "" : String(value); }
    function isAe() { return hostRole() === "after-effects"; }

    function appInfo() {
        var version = "", build = "", locale = "";
        try { version = safeString(app.version); } catch (e1) {}
        try { build = safeString(app.build); } catch (e2) {}
        try { locale = safeString(app.isoLanguage); } catch (e3) {}
        return { name: safeString(app.name), version: version, build: build, locale: locale, role: hostRole() };
    }

    function aeActiveComp() {
        try { return app.project && app.project.activeItem && app.project.activeItem instanceof CompItem ? app.project.activeItem : null; } catch (e) { return null; }
    }

    function aeSourceFile(item) {
        try { if (item && item.mainSource && item.mainSource.file) return item.mainSource.file.fsName; } catch (e) {}
        return "";
    }

    function isPsdPath(path) {
        path = safeString(path).toLowerCase();
        return path.substr(-4) === ".psd" || path.substr(-4) === ".psb";
    }

    function aeFindComp(id) {
        id = parseInt(id, 10);
        for (var i = 1; app.project && i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.id === id) return item;
        }
        return null;
    }

    function aeCompFromPayload(payload) {
        if (payload && payload.compId) {
            var comp = aeFindComp(payload.compId);
            if (comp) return comp;
        }
        return aeActiveComp();
    }

    function aeLayerSource(layer) {
        var source = null;
        try { source = layer.source; } catch (e) {}
        if (!source) return null;
        var path = aeSourceFile(source);
        return { id: source.id, name: source.name, typeName: source.typeName || "", path: path, isPsd: isPsdPath(path), width: source.width || 0, height: source.height || 0 };
    }

    function aeLayerSummary(layer) {
        var row = { index: layer.index, id: layer.id, name: layer.name, matchName: layer.matchName, enabled: layer.enabled, inPoint: layer.inPoint, outPoint: layer.outPoint, source: aeLayerSource(layer) };
        try { row.opacity = layer.opacity.value; } catch (e1) {}
        try {
            var text = layer.property("Source Text");
            if (text) {
                var doc = text.value;
                row.text = doc.text || "";
                row.font = doc.font || "";
                row.fauxBold = !!doc.fauxBold;
            }
        } catch (e2) {}
        return row;
    }

    function aeHostInfo() {
        var comp = aeActiveComp();
        return {
            product: PRODUCT, bridgeVersion: VERSION, protocolVersion: PROTOCOL, adapter: "cep-extendscript", host: appInfo(),
            projectFile: app.project && app.project.file ? app.project.file.fsName : "",
            activeComp: comp ? { id: comp.id, name: comp.name, layers: comp.numLayers, width: comp.width, height: comp.height, duration: comp.duration, frameRate: comp.frameRate } : null
        };
    }

    function aeProjectInfo() {
        var comps = [];
        if (!app.project) return { hasProject: false };
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem) comps.push({ id: item.id, name: item.name, layers: item.numLayers, duration: item.duration, width: item.width, height: item.height, frameRate: item.frameRate });
        }
        var active = aeActiveComp();
        return { hasProject: true, file: app.project.file ? app.project.file.fsName : "", numItems: app.project.numItems, activeComp: active ? { id: active.id, name: active.name, layers: active.numLayers } : null, comps: comps };
    }

    function aeScanTextLayers() {
        var rows = [];
        if (!app.project) return rows;
        for (var i = 1; i <= app.project.numItems; i++) {
            var comp = app.project.item(i);
            if (!(comp instanceof CompItem)) continue;
            for (var j = 1; j <= comp.numLayers; j++) {
                var layer = comp.layer(j), prop = null;
                try { prop = layer.property("Source Text"); } catch (e) {}
                if (!prop) continue;
                var doc = prop.value;
                rows.push({ compId: comp.id, compName: comp.name, layerIndex: j, layerName: layer.name, text: doc.text || "", font: doc.font || "", fauxBold: !!doc.fauxBold, enabled: layer.enabled });
            }
        }
        return rows;
    }

    function aeScanProjectItems() {
        var rows = [];
        if (!app.project) return rows;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i), row = { id: item.id, name: item.name, typeName: safeString(item.typeName) };
            if (item instanceof CompItem) {
                row.kind = "composition";
                row.width = item.width;
                row.height = item.height;
                row.duration = item.duration;
                row.frameRate = item.frameRate;
            } else if (item instanceof FootageItem) {
                row.kind = "footage";
                row.path = aeSourceFile(item);
                row.isPsd = isPsdPath(row.path);
                row.width = item.width || 0;
                row.height = item.height || 0;
            }
            rows.push(row);
        }
        return rows;
    }

    function aeScanCompLayers(payload) {
        var comp = aeCompFromPayload(payload || {});
        if (!comp) throw new Error("No After Effects composition is active");
        var rows = [];
        for (var i = 1; i <= comp.numLayers; i++) rows.push(aeLayerSummary(comp.layer(i)));
        return { comp: { id: comp.id, name: comp.name }, layers: rows };
    }

    function aeScanPsdSources(payload) {
        var filter = safeString((payload || {}).path).toLowerCase(), rows = [];
        if (!app.project) return { count: 0, items: rows };
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (!(item instanceof FootageItem)) continue;
            var path = aeSourceFile(item);
            if (!isPsdPath(path) || (filter && path.toLowerCase() !== filter)) continue;
            var row = { id: item.id, name: item.name, path: path, width: item.width || 0, height: item.height || 0, usedBy: [] };
            for (var c = 1; c <= app.project.numItems; c++) {
                var comp = app.project.item(c);
                if (!(comp instanceof CompItem)) continue;
                for (var l = 1; l <= comp.numLayers; l++) {
                    try { if (comp.layer(l).source && comp.layer(l).source.id === item.id) row.usedBy.push({ compId: comp.id, compName: comp.name, layerIndex: l, layerName: comp.layer(l).name }); } catch (e) {}
                }
            }
            rows.push(row);
        }
        return { count: rows.length, items: rows };
    }

    function aeImportFootage(path) {
        var file = new File(safeString(path));
        if (!file.exists) throw new Error("File not found: " + file.fsName);
        var options = new ImportOptions(file);
        try { if (options.canImportAs(ImportAsType.FOOTAGE)) options.importAs = ImportAsType.FOOTAGE; } catch (e) {}
        return app.project.importFile(options);
    }

    function aeApplyTextUpdates(items) {
        var changed = 0, skipped = 0;
        app.beginUndoGroup("Adobe Creative MCP - Apply AE Text Updates");
        for (var i = 0; i < items.length; i++) {
            var row = items[i], comp = aeFindComp(row.compId), index = parseInt(row.layerIndex, 10);
            if (!comp || index < 1 || index > comp.numLayers) { skipped++; continue; }
            var prop = comp.layer(index).property("Source Text");
            if (!prop) { skipped++; continue; }
            var doc = prop.value;
            if (row.text !== undefined) doc.text = safeString(row.text);
            if (row.font) doc.font = safeString(row.font);
            if (row.fauxBold !== undefined) doc.fauxBold = !!row.fauxBold;
            prop.setValue(doc);
            changed++;
        }
        app.endUndoGroup();
        return { changed: changed, skipped: skipped };
    }

    function aeApplyFont(payload) {
        var font = safeString(payload.font), items = payload.items || [], changed = 0, skipped = 0;
        if (!font) throw new Error("font is empty");
        app.beginUndoGroup("Adobe Creative MCP - Apply AE Font");
        for (var i = 0; i < items.length; i++) {
            var row = items[i], comp = aeFindComp(row.compId), index = parseInt(row.layerIndex, 10);
            if (!comp || index < 1 || index > comp.numLayers) { skipped++; continue; }
            var prop = comp.layer(index).property("Source Text");
            if (!prop) { skipped++; continue; }
            var doc = prop.value;
            doc.font = font;
            if (payload.fauxBold !== undefined) doc.fauxBold = !!payload.fauxBold;
            prop.setValue(doc);
            changed++;
        }
        app.endUndoGroup();
        return { changed: changed, skipped: skipped };
    }

    function aeReplaceSource(payload) {
        var comp = aeCompFromPayload(payload || {}), index = parseInt(payload.layerIndex, 10);
        if (!comp || index < 1 || index > comp.numLayers) throw new Error("Invalid comp or layerIndex");
        var layer = comp.layer(index);
        if (!layer.replaceSource) throw new Error("Layer does not support replaceSource");
        var item = aeImportFootage(payload.path);
        layer.replaceSource(item, payload.fixExpressions !== false);
        return { compId: comp.id, compName: comp.name, layerIndex: index, layerName: layer.name, sourceId: item.id, sourceName: item.name, path: aeSourceFile(item) };
    }

    function aeReloadPsdSources(payload) {
        var filter = safeString((payload || {}).path).toLowerCase(), reloaded = 0, skipped = 0;
        if (!app.project) return { reloaded: 0, skipped: 0 };
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i), path = aeSourceFile(item);
            if (!(item instanceof FootageItem) || !isPsdPath(path) || (filter && path.toLowerCase() !== filter)) continue;
            try { if (item.mainSource.reload) { item.mainSource.reload(); reloaded++; } else skipped++; } catch (e) { skipped++; }
        }
        return { reloaded: reloaded, skipped: skipped, path: payload && payload.path ? payload.path : "" };
    }

    function psDocPath(doc) { try { return doc.fullName ? doc.fullName.fsName : ""; } catch (e) { return ""; } }

    function psDocSummary(doc) {
        return { name: safeString(doc.name), path: psDocPath(doc), width: doc.width, height: doc.height, resolution: doc.resolution, mode: safeString(doc.mode), bitsPerChannel: safeString(doc.bitsPerChannel) };
    }

    function psFindDocument(payload) {
        var wanted = safeString((payload || {}).path).toLowerCase();
        if (wanted) {
            for (var i = 0; i < app.documents.length; i++) if (psDocPath(app.documents[i]).toLowerCase() === wanted) return { doc: app.documents[i], opened: false };
            if ((payload || {}).open !== false) {
                var opened = app.open(new File(payload.path));
                return { doc: opened, opened: true };
            }
        }
        if (app.documents.length < 1) throw new Error("No Photoshop document is open");
        return { doc: app.activeDocument, opened: false };
    }

    function psLayerPath(layer) {
        var names = [safeString(layer.name)], parent = layer.parent;
        while (parent && parent.typename !== "Document") { names.unshift(safeString(parent.name)); parent = parent.parent; }
        return names;
    }

    function psLayerText(layer) {
        try {
            if (safeString(layer.typename) !== "ArtLayer") return null;
            var kind = safeString(layer.kind);
            if (kind.indexOf("TEXT") < 0 && typeof LayerKind !== "undefined" && layer.kind !== LayerKind.TEXT) return null;
            var text = layer.textItem;
            return { text: safeString(text.contents), font: safeString(text.font), size: text.size ? Number(text.size) : 0 };
        } catch (e) { return null; }
    }

    function psWalkLayers(collection, rows, textOnly) {
        for (var i = 0; i < collection.length; i++) {
            var layer = collection[i], row = { name: safeString(layer.name), typename: safeString(layer.typename), path: psLayerPath(layer) }, text = psLayerText(layer);
            if (text) { row.text = text.text; row.font = text.font; row.size = text.size; }
            if (!textOnly || text) rows.push(row);
            try { if (layer.typename === "LayerSet") psWalkLayers(layer.layers, rows, textOnly); } catch (e) {}
        }
    }

    function psInspectDocument(payload) {
        var state = psFindDocument(payload || {}), rows = [];
        psWalkLayers(state.doc.layers, rows, false);
        var result = { document: psDocSummary(state.doc), layers: rows };
        if (state.opened && (payload || {}).closeAfter !== false) state.doc.close(SaveOptions.DONOTSAVECHANGES);
        return result;
    }

    function psFindLayer(collection, parts, index) {
        for (var i = 0; i < collection.length; i++) {
            var layer = collection[i];
            if (safeString(layer.name) !== safeString(parts[index])) continue;
            if (index === parts.length - 1) return layer;
            try { if (layer.typename === "LayerSet") { var found = psFindLayer(layer.layers, parts, index + 1); if (found) return found; } } catch (e) {}
        }
        return null;
    }

    function psApplyTextUpdates(payload) {
        var state = psFindDocument(payload || {}), items = payload.items || payload.edits || [], changed = 0, skipped = 0;
        for (var i = 0; i < items.length; i++) {
            var row = items[i], parts = row.layerPath instanceof Array ? row.layerPath : [safeString(row.layerName || row.name)];
            var layer = psFindLayer(state.doc.layers, parts, 0);
            if (!layer) { skipped++; continue; }
            var text = psLayerText(layer);
            if (!text) { skipped++; continue; }
            if (row.text !== undefined) layer.textItem.contents = safeString(row.text);
            if (row.font) layer.textItem.font = safeString(row.font);
            if (row.size) layer.textItem.size = Number(row.size);
            changed++;
        }
        if (payload.save !== false) state.doc.save();
        var result = { document: psDocSummary(state.doc), changed: changed, skipped: skipped };
        if (state.opened && payload.closeAfter !== false) state.doc.close(payload.save === false ? SaveOptions.DONOTSAVECHANGES : SaveOptions.SAVECHANGES);
        return result;
    }

    function psScanTextLayers(payload) {
        var state = psFindDocument(payload || {}), rows = [];
        psWalkLayers(state.doc.layers, rows, true);
        var result = { document: psDocSummary(state.doc), items: rows };
        if (state.opened && (payload || {}).closeAfter !== false) state.doc.close(SaveOptions.DONOTSAVECHANGES);
        return result;
    }

    function psHostInfo() {
        var active = app.documents.length > 0 ? psDocSummary(app.activeDocument) : null;
        return { product: PRODUCT, bridgeVersion: VERSION, protocolVersion: PROTOCOL, adapter: "cep-extendscript", host: appInfo(), activeDocument: active, openDocuments: app.documents.length };
    }

    function psProjectInfo() {
        var docs = [];
        for (var i = 0; i < app.documents.length; i++) docs.push(psDocSummary(app.documents[i]));
        return { host: "photoshop", documents: docs };
    }

    function capabilities() {
        if (isAe()) return { product: PRODUCT, bridgeVersion: VERSION, protocolVersion: PROTOCOL, role: "after-effects", commands: ["ping", "get_host_info", "get_capabilities", "get_project_info", "get_active_comp", "scan_text_layers", "scan_project_items", "scan_psd_sources", "scan_comp_layers", "apply_text_updates", "apply_font", "replace_footage_source", "reload_psd_sources", "save_project", "run_jsx"], features: { aeProjectControl: true, psdSourceRecognition: true, aePsdReload: true, textLayerEditing: true, multiAgentQueue: true } };
        return { product: PRODUCT, bridgeVersion: VERSION, protocolVersion: PROTOCOL, role: "photoshop", commands: ["ping", "get_host_info", "get_capabilities", "get_project_info", "scan_text_layers", "inspect_psd_document", "apply_psd_text_updates", "save_document", "run_jsx"], features: { psdRecognition: true, psdTextEditing: true, photoshopDocumentControl: true, multiAgentQueue: true } };
    }

    AdobeCreativeMCP.execute = function (jsonCommand) {
        try {
            var command = parseJson(jsonCommand), type = safeString(command.type), payload = command.payload || {};
            if (type === "ping") return ok("pong", { product: PRODUCT, bridgeVersion: VERSION, protocolVersion: PROTOCOL, role: hostRole(), host: appInfo() });
            if (type === "get_host_info") return ok("host info", isAe() ? aeHostInfo() : psHostInfo());
            if (type === "get_capabilities") return ok("capabilities", capabilities());
            if (type === "get_project_info") return ok("project info", isAe() ? aeProjectInfo() : psProjectInfo());
            if (type === "get_active_comp") return ok("active comp", isAe() && aeActiveComp() ? { id: aeActiveComp().id, name: aeActiveComp().name, layers: aeActiveComp().numLayers } : null);
            if (type === "scan_text_layers") return ok("text layers", { items: isAe() ? aeScanTextLayers() : psScanTextLayers(payload).items });
            if (type === "scan_project_items") return ok("project items", isAe() ? { items: aeScanProjectItems() } : psProjectInfo());
            if (type === "scan_psd_sources" || type === "inspect_psd") { if (!isAe()) throw new Error("scan_psd_sources is an After Effects command"); return ok("PSD sources", aeScanPsdSources(payload)); }
            if (type === "scan_comp_layers") { if (!isAe()) throw new Error("scan_comp_layers is an After Effects command"); return ok("composition layers", aeScanCompLayers(payload)); }
            if (type === "apply_text_updates") { if (!isAe()) throw new Error("Use apply_psd_text_updates in Photoshop"); return ok("AE text updated", aeApplyTextUpdates(payload.items || [])); }
            if (type === "apply_font") { if (!isAe()) throw new Error("Use apply_psd_text_updates in Photoshop"); return ok("AE font applied", aeApplyFont(payload)); }
            if (type === "replace_footage_source") { if (!isAe()) throw new Error("replace_footage_source is an After Effects command"); return ok("footage source replaced", aeReplaceSource(payload)); }
            if (type === "reload_psd_sources") { if (!isAe()) throw new Error("reload_psd_sources is an After Effects command"); return ok("PSD sources reloaded", aeReloadPsdSources(payload)); }
            if (type === "inspect_psd_document") { if (isAe()) throw new Error("inspect_psd_document is a Photoshop command"); return ok("PSD document inspected", psInspectDocument(payload)); }
            if (type === "apply_psd_text_updates") { if (isAe()) throw new Error("apply_psd_text_updates is a Photoshop command"); return ok("PSD text updated", psApplyTextUpdates(payload)); }
            if (type === "save_document") { if (isAe()) throw new Error("save_document is a Photoshop command"); app.activeDocument.save(); return ok("document saved", psDocSummary(app.activeDocument)); }
            if (type === "save_project") { if (!isAe()) throw new Error("save_project is an After Effects command"); app.project.save(); return ok("project saved", { file: app.project.file ? app.project.file.fsName : "" }); }
            if (type === "run_jsx") return ok("jsx executed", { result: eval(safeString(payload.jsx)) });
            return fail("unknown command type: " + type, "UNKNOWN_COMMAND");
        } catch (error) {
            try { app.endUndoGroup(); } catch (_) {}
            return fail(error.toString(), "ADOBE_HOST_EXECUTION_ERROR");
        }
    };
}());
