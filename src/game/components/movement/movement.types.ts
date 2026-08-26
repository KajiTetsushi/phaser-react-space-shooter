interface MovementComponentConfigInertialess {
    accelerates: false;
    /**
     * Fixed value of how fast the object will move in the given direction.
     */
    velocity?: number;
}

interface MovementComponentConfigPhysical {
    accelerates: true;
    /**
     * A value to increase, per frame, of how fast the object will move in the given direction.
     */
    velocityIncrement?: number;
    /**
     * An upper limit value to how fast the object can increase to in the given direction.
     */
    velocityMaximum?: number;
    /**
     * A value to set the amount of directional slow down in pixels per second when the directional control is released.
     */
    drag?: number;
}

export type MovementComponentConfig = MovementComponentConfigInertialess | MovementComponentConfigPhysical;
