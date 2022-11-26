#' @import subprocess

# API
# get returns json of volcano data
# post updates the data

is_windows <- function () (tolower(.Platform$OS.type) == "windows")

R_binary <- function () {
  R_exe <- ifelse (is_windows(), "R.exe", "R")
  return(file.path(R.home("bin"), R_exe))
}

#' @export
init <- function() {
  handle <- spawn_process(R_binary(), c('--no-save'))
  process_write(handle, 'getwd()\n')
  process_write(handle, 'erupt::init_server()\n')
  return(handle)
}




