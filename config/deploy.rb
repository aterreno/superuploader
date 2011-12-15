require "bundler/capistrano"

set :application, "superupload"
set :user, "ubuntu"
set :host, "ec2-107-20-118-43.compute-1.amazonaws.com"
set :deploy_to, "/var/www/#{application}"
set :use_sudo, true

set :scm, :git
set :repository, "git@github.com:aterreno/superuploader.git"
set :branch, "master"
set :keep_releases, 3

set :deploy_via, :remote_cache
role :app, host

set :bluepill, 'bluepill'

default_run_options[:pty] = true

namespace :deploy do
  task :start, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} #{bluepill} start #{application}"
  end

  task :stop, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} #{bluepill} stop #{application}"
  end

  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} #{bluepill} restart #{application}"
  end

  task :create_deploy_to_with_sudo, :roles => :app do
    run "#{try_sudo :as => 'root'} mkdir -p #{deploy_to}"
  end

  task :npm_install, :roles => :app, :except => { :no_release => true } do
    run "cd #{release_path} && npm install"
  end
end

before 'deploy:setup', 'deploy:create_deploy_to_with_sudo'
after 'deploy:finalize_update', 'deploy:npm_install'