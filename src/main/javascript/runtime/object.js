import { FLCard } from './card.js';

const FLObject = function(cx) {
}
FLObject.prototype._updateTemplate = FLCard.prototype._updateTemplate;
FLObject.prototype._addItem = FLCard.prototype._addItem;
FLObject.prototype._updateContent = FLCard.prototype._updateContent;
FLObject.prototype._updateContainer = FLCard.prototype._updateContainer;
FLObject.prototype._updatePunnet = FLCard.prototype._updatePunnet;
FLObject.prototype._updateStyle = FLCard.prototype._updateStyle;
FLObject.prototype._updateList = FLCard.prototype._updateList;
FLObject.prototype._updateImage = FLCard.prototype._updateImage;
FLObject.prototype._updateLink = FLCard.prototype._updateLink;
FLObject.prototype._diffLists = FLCard.prototype._diffLists;
FLObject.prototype._attachHandlers = FLCard.prototype._attachHandlers;
FLObject.prototype._resizeDisplayElements = FLCard.prototype._resizeDisplayElements;

export { FLObject };
