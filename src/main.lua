-- Keep the platform callbacks here; implement behavior in modules.
local app = require("app.lifecycle")

function OnStart()
  app.start()
end

function OnUpdate(dt)
  app.update(dt)
end

function OnDestroy()
  app.destroy()
end
