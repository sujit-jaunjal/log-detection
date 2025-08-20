process(logs) {
  return logs.map(log => ({
    ...log,
    source: log.filePath.includes('apache') ? 'apache' : 'windows'
  }));
}