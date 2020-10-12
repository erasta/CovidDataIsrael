const { withLeaflet, Path } = ReactLeaflet;
class AbstractComponent extends Path {
    // props.leaflet is not used but destructured out so it's not passed to this.leafletComponent
    // eslint-disable-next-line no-unused-vars
    createLeafletElement({ position, leaflet, ...options }) {
        return new this.leafletComponent(position, options);
    }

    updateLeafletElement(
        fromProps,
        { startAngle, stopAngle, position, radius }
    ) {
        if (fromProps.startAngle !== startAngle) {
            this.leafletElement.setStartAngle(startAngle);
        }
        if (fromProps.stopAngle !== stopAngle) {
            this.leafletElement.setStopAngle(stopAngle);
        }
        if (fromProps.radius !== radius) {
            this.leafletElement.setRadius(radius);
        }
        if (fromProps.position !== position) {
            this.leafletElement.setLatLng(position);
        }
    }

    get leafletComponent() {
        throw new Error('leafletComponent getter not implemented');
    }
}
class SemiCircle1 extends AbstractComponent {
    get leafletComponent() {
        return L.SemiCircle;
    }
}
const SemiCircle = withLeaflet(SemiCircle1);
