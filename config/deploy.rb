set :application,         "superupload"
set :node_file,           "app.js"
set :repository,          "git@github.com:aterreno/superuploader.git"
set :host,                "ec2-107-20-118-43.compute-1.amazonaws.com"
set :deploy_to,           "/var/www/#{application}"
set :repository_cache,    "#{application}_cache"
set :environment,         "production"

set :deploy_to,           "/var/www/#{application}"
set :repository_cache,    "#{application}_cache"
set :environment,         "production"

role :app, host

set :branch,              "master"
set :keep_releases,       3
set :user,                "ubuntu"
set :deploy_via,          :remote_cache
set :scm,                 :git
set :runner,              "ubuntu"

set :admin_runner,        "ubuntu"
set :use_sudo,            true

role :app, host,        :primary => true

ssh_options[:forward_agent]   = true
ssh_options[:paranoid]        = true
default_run_options[:pty]     = true

namespace :deploy do
  task :start, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} start #{application}"
  end

  task :stop, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} stop #{application}"
  end

  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} restart #{application} || #{try_sudo :as => 'root'} start #{application}"
  end

  task :create_deploy_to_with_sudo, :roles => :app do
    run "#{try_sudo :as => 'root'} mkdir -p #{deploy_to}"
    run "#{try_sudo :as => 'root'} chown #{admin_runner}:#{admin_runner} #{deploy_to}"
  end

  desc "Check required packages and install if packages are not installed"
  task :update_packages, roles => :app do
    run "cd #{release_path} && npm -d install"
  end
  
  task :write_upstart_script, :roles => :app do
    upstart_script = <<-UPSTART
  description "#{application}"

  start on startup
  stop on shutdown

  script
      # We found $HOME is needed. Without it, we ran into problems
      export HOME="/home/#{admin_runner}"

      cd #{current_path}
      exec sudo -u root sh -c "/usr/local/bin/node #{current_path}/#{node_file} production >> #{shared_path}/log/#{application}.log 2>&1"
  end script
  respawn
  UPSTART
  put upstart_script, "/tmp/#{application}_upstart.conf"
    run "#{try_sudo :as => 'root'} mv /tmp/#{application}_upstart.conf /etc/init/#{application}.conf"
  end
  
end

before 'deploy:setup', 'deploy:create_deploy_to_with_sudo'
after 'deploy:setup', 'deploy:write_upstart_script'
after 'deploy:update', 'deploy:update_packages'
after "deploy:update", "deploy:cleanup" 
