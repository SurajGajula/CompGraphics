class Camera {
    /**
     * Constructor for Camera class
     * @param {HTMLCanvasElement} canvas - The canvas element for aspect ratio calculation
     */
    constructor(canvas) {
        this.fov = 60;
        
        this.eye = new Vector3([0, 0, 0]);

        this.at = new Vector3([0, 0, -1]);

        this.up = new Vector3([0, 1, 0]);
        
        this.viewMatrix = new Matrix4();
        this.updateViewMatrix();
        
        this.projectionMatrix = new Matrix4();
        this.updateProjectionMatrix(canvas);
        
        this.speed = 0.1;
        
        this.rotationAngle = 5;
        
        this.mouseSensitivity = 0.2;
        
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.minHeight = 0.5;
    }
    
    /**
     * Update the view matrix based on eye, at, and up vectors
     */
    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }
    
    /**
     * Ensure camera doesn't go below minimum height
     */
    enforceMinHeight() {
        if (this.eye.elements[1] < this.minHeight) {
            const heightDiff = this.minHeight - this.eye.elements[1];
            
            this.eye.elements[1] = this.minHeight;
            this.at.elements[1] += heightDiff;
        }
    }
    
    /**
     * Update the projection matrix based on canvas dimensions
     * @param {HTMLCanvasElement} canvas - The canvas element for aspect ratio calculation
     */
    updateProjectionMatrix(canvas) {
        const aspect = canvas.width / canvas.height;
        this.projectionMatrix.setPerspective(this.fov, aspect, 0.1, 1000);
    }
    
    /**
     * Move the camera forward
     */
    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        
        this.eye.add(f);
        this.at.add(f);
        
        this.enforceMinHeight();
        
        this.updateViewMatrix();
    }
    
    /**
     * Move the camera backward
     */
    moveBackward() {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);
        
        this.eye.add(b);
        this.at.add(b);
        
        this.enforceMinHeight();
        
        this.updateViewMatrix();
    }
    
    /**
     * Move the camera left
     */
    moveLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);
        
        this.eye.add(s);
        this.at.add(s);
        
        this.enforceMinHeight();
        
        this.updateViewMatrix();
    }
    
    /**
     * Move the camera right
     */
    moveRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);
        
        this.eye.add(s);
        this.at.add(s);
        
        this.enforceMinHeight();
        
        this.updateViewMatrix();
    }
    
    /**
     * Pan the camera left (rotate around up vector)
     */
    panLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.rotationAngle, 
                                this.up.elements[0], 
                                this.up.elements[1], 
                                this.up.elements[2]);
        
        let f_prime = rotationMatrix.multiplyVector3(f);
        
        this.at.set(this.eye);
        this.at.add(f_prime);
        
        this.updateViewMatrix();
    }
    
    /**
     * Pan the camera right (rotate around up vector)
     */
    panRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.rotationAngle, 
                                this.up.elements[0], 
                                this.up.elements[1], 
                                this.up.elements[2]);
        
        let f_prime = rotationMatrix.multiplyVector3(f);
        
        this.at.set(this.eye);
        this.at.add(f_prime);
        
        this.updateViewMatrix();
    }
    
    /**
     * Rotate the camera based on mouse movement
     * @param {number} deltaX - Change in X position of mouse
     * @param {number} deltaY - Change in Y position of mouse
     */
    rotateWithMouse(deltaX, deltaY) {
        if (deltaX !== 0) {
            let f = new Vector3();
            f.set(this.at);
            f.sub(this.eye);
            
            let rotationMatrix = new Matrix4();
            let rotationAmount = -deltaX * this.mouseSensitivity;
            rotationMatrix.setRotate(rotationAmount, 
                                    this.up.elements[0], 
                                    this.up.elements[1], 
                                    this.up.elements[2]);
            
            let f_prime = rotationMatrix.multiplyVector3(f);
            
            this.at.set(this.eye);
            this.at.add(f_prime);
        }
        
        if (deltaY !== 0) {
            let f = new Vector3();
            f.set(this.at);
            f.sub(this.eye);
            
            let s = Vector3.cross(f, this.up);
            s.normalize();
            
            let rotationMatrix = new Matrix4();
            let rotationAmount = -deltaY * this.mouseSensitivity;
            rotationMatrix.setRotate(rotationAmount, 
                                    s.elements[0], 
                                    s.elements[1], 
                                    s.elements[2]);
            
            let f_prime = rotationMatrix.multiplyVector3(f);
            
            let up_prime = rotationMatrix.multiplyVector3(this.up);
            this.up = up_prime;
            
            this.at.set(this.eye);
            this.at.add(f_prime);
        }
        
        this.updateViewMatrix();
    }
} 