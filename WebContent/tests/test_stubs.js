//////////////////////////////////
var sut = {
        getObject: function() {
            console.log("Original getObject() called");
            return {
                setModel: function() {
                    console.log("setModel()");
                    return "original";
                },
                postMessage: function() {
                    console.log("postMessage()");
                    return "original";
                }
            };
        }
};


module("Test original");
test("test call", function() {
    var obj = sut.getObject();
    ok(obj.setModel() === "original", "Original called okay");
});


module("Test stubbing ONE", {
    setup: function() {
        sandbox = sinon.sandbox.create();
        sandbox.stub(sut, "getObject").returns({
            setModel: function() {
                console.log("stub for setModel()");
                return "stubbed";
            },
            postMessage: function() {
                console.log("{stub for postMessage");
                return "stubbed";
            }
        });
    },
    teardown: function() {
        sandbox.restore();
    }
});

test("test call of stub", function() {
    var obj = sut.getObject();
    ok(obj.setModel() === "stubbed");
});


module("Test stubbing TWO", {
    setup: function() {
        sandbox = sinon.sandbox.create();
        sandbox.stub(sut, "getObject").returns({
            setModel: function() {
                console.log("stub for setModel()");
                return "stubbed";
            },
            postMessage: function() {
                console.log("stub for postMessage");
                return "stubbed";
            },
            extraMethod: function() {
                console.log("extraMethod() called");
                return "stubbed";
            }
        });
    },
    teardown: function() {
        sandbox.restore();
    }
});

test("test call of stub", function() {
    var obj = sut.getObject();
    ok(obj.setModel() === "stubbed");
    ok(obj.extraMethod() === "stubbed", "Extra method stubbed successfuly");
});